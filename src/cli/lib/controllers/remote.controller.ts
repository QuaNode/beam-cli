import { Injectable, Inject, forwardRef } from '@nestjs/common';
import * as cluster from 'cluster';
import * as path from 'path';
import { BehavioursService } from '../services/behaviours.service';
import { LoggerService } from '../utils/logger.service';
import { DEFAULT_PORT } from '../utils/constants';

@Injectable()
export class RemoteController {
  private readonly baseUrl: string;
  private readonly maxRetries = 10;
  private readonly retryDelay = 1000;

  constructor(
    @Inject(forwardRef(() => BehavioursService))
    private readonly behavioursService: BehavioursService,
    @Inject(forwardRef(() => LoggerService))
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || DEFAULT_PORT}/api/v1`;
  }

  async run(command: string, args: any = {}, options: any = {}): Promise<any> {
    this.logger.log(`Processing remote command: ${command}`);

    const isHealthy = await this.checkHealth();

    if (isHealthy) {
      return this.executeRemote(command, args);
    } else {
      const isPortOpen = await this.isPortInUse(process.env.PORT || DEFAULT_PORT);
      if (isPortOpen) {
        this.logger.warn(`Port ${process.env.PORT || DEFAULT_PORT} is in use. Assuming backend is already running (but unhealthy). Skipping spawn.`);
      } else {
        this.logger.warn('Backend not accessible. Spawning local backend process...');
        await this.startBackend(options);
      }
      return this.executeRemote(command, args);
    }
  }

  private async checkHealth(url: string = this.baseUrl, forceInit: boolean = false): Promise<boolean> {
    try {
      const healthCheck = this.behavioursService.run('health', {}, url, forceInit);
      const timeout = new Promise<any>((_, reject) => setTimeout(() => reject(new Error('Timeout')), this.retryDelay));

      const res = await Promise.race([healthCheck, timeout]);
      return res && res.status === 'healthy';
    } catch (e: any) {
      this.logger.debug(`Health check failed: ${e.message}`);
      return false;
    }
  }

  private startBackend(options: any = {}): Promise<void> {
    return new Promise((resolve, reject) => {

      const possiblePaths = [
        path.resolve(__dirname, '../../../backend/server.js'),
        path.resolve(__dirname, 'src/backend/server.js'),
        path.resolve(process.cwd(), 'dist/src/backend/server.js')
      ];

      const fs = require('fs');
      let serverPath = possiblePaths.find(p => fs.existsSync(p));

      if (!serverPath) {
        this.logger.error(`Could not locate server.js. Checked: ${possiblePaths.join(', ')}`);
        reject(new Error('Backend server file not found'));
        return;
      }

      if (cluster.setupPrimary) {
        cluster.setupPrimary({ exec: serverPath, silent: !options.verbose });
      } else {
        cluster.setupMaster({ exec: serverPath, silent: !options.verbose });
      }

      this.logger.log(`Starting backend worker...`);
      const worker = cluster.fork();

      worker.on('online', () => {
        this.logger.log(`Backend worker ${worker.process.pid} is online.`);
        this.waitForBackend(resolve, reject);
      });

      worker.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
          this.logger.warn(`Backend worker exited with code ${code}. Restarting...`);
          setTimeout(() => {
            this.startBackend(options).catch(err => {
              this.logger.error(`Failed to restart backend: ${err.message}`);
            });
          }, this.retryDelay);
        }
      });
    });
  }

  private waitForBackend(resolve: () => void, reject: (err: Error) => void, attempts: number = 0) {
    if (attempts >= this.maxRetries) {
      this.logger.warn('Backend health check timed out.');
      resolve();
      return;
    }

    this.checkHealth(this.baseUrl, true).then((isHealthy) => {
      if (isHealthy) {
        this.logger.success('Backend is ready.');
        resolve();
      } else {
        if (attempts >= this.maxRetries) {
          this.logger.warn('Backend started but health check still unavailable after retries.');
          resolve();
        } else {
          setTimeout(() => {
            this.waitForBackend(resolve, reject, attempts + 1);
          }, this.retryDelay);
        }
      }
    });
  }

  private isPortInUse(port: any): Promise<boolean> {
    return new Promise((resolve) => {
      const net = require('net');
      const tester = net.createServer()
        .once('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            resolve(true);
          } else {
            resolve(false);
          }
        })
        .once('listening', () => {
          tester.once('close', () => { resolve(false); }).close();
        })
        .listen(port);
    });
  }

  private async executeRemote(command: string, args: any): Promise<any> {
    try {
      const response = await this.behavioursService.run(command, args, this.baseUrl);
      return response;
    } catch (error: any) {
      this.logger.error(`Failed to execute remote command ${command}: ${error.message}`);
      throw error;
    }
  }
}
