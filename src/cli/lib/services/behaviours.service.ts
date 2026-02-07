import { Injectable } from '@nestjs/common';
import { LoggerService } from '../utils/logger.service';

const Behaviours = require('js-behaviours');

@Injectable()
export class BehavioursService {
  private behaviours: any;
  private caches: any = {};
  private tenants: any = process.env.TENANTS ? JSON.parse(process.env.TENANTS) : {};

  constructor(private readonly logger: LoggerService) { }

  async run(behaviour: string, parameters: any = {}, baseURL: string, forceInit: boolean = false): Promise<any> {
    if (!baseURL) {
      throw new Error('Base URL is required');
    }
    const user = process.env.USER || 'cli_user';

    if (!this.behaviours || forceInit) {
      await this.initBehaviours(baseURL);
    }

    return new Promise((resolve, reject) => {
      this.behaviours.ready(() => {

        let tenantID;
        if (process.env.PORT && this.tenants) {
          const tenant = Object.keys(this.tenants).find((key) => {
            return this.tenants[key].port == process.env.PORT;
          });
          if (tenant) tenantID = this.tenants[tenant].id;
        }

        const headers = tenantID ? {
          __tenant__: {
            key: 'Behaviour-Tenant',
            type: 'header',
            value: tenantID
          }
        } : undefined;

        if (behaviour === 'list') {
          if (typeof this.behaviours.behaviours === 'function') {
            this.behaviours.behaviours({}, (...args: any[]) => {
              const [response, error] = args;
              if (error) reject(error);
              else resolve(response);
            });
          } else {
            reject(new Error('Behaviours method not found'));
          }
          return;
        }

        if (typeof this.behaviours[behaviour] !== 'function') {
          reject(new Error(`Behaviour '${behaviour}' not found on remote.`));
          return;
        }

        this.behaviours[behaviour](parameters, (response: any, error: any) => {
          if (response && response.token) {
            const { user: tokenUser } = response;
            if (tokenUser && tokenUser.login && tokenUser.login != user) {
              this.caches[tokenUser.login] = this.caches[user];
            }
          }

          if (error && error.code != 0 && error.code != 401) {
            reject(new Error(error.message || error));
          } else {
            if (error) reject(error);
            else resolve(response);
          }
        }, headers);
      });
    });
  }

  private initBehaviours(baseURL: string): Promise<void> {
    const user = process.env.USER || 'cli_user';
    return new Promise((resolve, reject) => {
      try {
        this.behaviours = new Behaviours(baseURL, (error: any) => {
          if (error && (error.code === 'ECONNREFUSED' || error.toString().includes('ECONNREFUSED'))) {
            // Backend not running/accessible. Reset instance so we retry fresh next time.
            this.logger.debug(`Connection refused to ${baseURL}. Resetting behaviours instance.`);
            this.behaviours = null;
          } else if (error && error.code == 0) {
            this.logger.debug(error);
            this.behaviours = null; // Also reset on generic init error
          } else if (error && error.code == 401) {
            this.caches[user] = undefined;
          }
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
