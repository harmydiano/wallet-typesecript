import AppValidation from './app.validation';
import AppProcessor from './app.processor';

/**
 * The Base model object where other models inherits or
 * overrides pre defined and static methods
 */
export default class AppModel {
  public tableName: string = '';
  public softDelete: boolean = true;
  public uniques: string[] = [];
  public returnDuplicate: boolean = false;
  public fillables: string[] = [];
  public updateFillables: string[] = [];
  public hiddenFields: string[] = [];

  constructor() {
    if (new.target === AppModel) {
      throw new TypeError('Cannot construct Abstract instances directly');
    }
  }

  /**
   * @return {Object} The validator object with the specified rules.
   */
  getValidator() {
    return new AppValidation();
  }

  /**
   *  @param {Model} model The model to get processor for
   * @return {Object} The processor class instance object
   */
  getProcessor(model: any) {
    return new AppProcessor(model);
  }
} 