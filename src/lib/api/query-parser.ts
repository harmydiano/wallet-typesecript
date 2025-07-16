import _ from 'lodash';

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: any;
  search?: string;
  all?: boolean;
  includes?: any;
  selection?: any;
  population?: any;
  regex?: any;
  nested?: any;
}

export default class QueryParser {
  private _query: any;
  private _search: any;
  private _selection: any;
  private _population: any;
  private _sort: any;
  private _all!: boolean;

  /**
   * @constructor
   * @param {Object} query This is a query object of the request
   */
  constructor(query: any) {
    this._query = { ...query };
    this.initialize(query);
    const excluded = [
      'per_page', 'page', 'limit', 'sort', 'all', 'includes',
      'selection', 'population', 'search', 'regex', 'nested',
    ];
    // omit special query string keys from query before passing down to the model for filtering
    this._query = _.omit(this._query, ...excluded);
    // Only get collection that has not been virtually deleted.
    // _.extend(this._query, { deleted: 0 });
    Object.assign(this, this._query);
  }

  /**
   * @return {Object} get the parsed query
   */
  get query(): any {
    return this._query;
  }

  /**
   * @param {Object} query set the parsed query
   */
  set query(query: any) {
    this._query = query;
  }

  /**
   * @return {Object} get the parsed query
   */
  get search(): any {
    return this._search;
  }

  /**
   * @return {Object} get the selection property
   */
  get selection(): any {
    if (this._selection) {
      return this._selection;
    }
    return [];
  }

  /**
   * @param {Object} value is the selection object
   */
  set selection(value: any) {
    this._selection = value;
  }

  /**
   * @return {Object} get the population object for query
   */
  get population(): any {
    if (this._population) {
      return this._population;
    }
    return [];
  }

  /**
   * @param {Object} value is the population object
   */
  set population(value: any) {
    this._population = value;
    if (!_.isObject(value)) {
      try {
        this._population = JSON.parse(value.toString());
      } catch (e) {
        console.log(e);
      }
    }
  }

  /**
   * when String i.e ?sort=name it is sorted by name ascending order
   * when Object ?sort[name]=desc {name: 'desc'} it is sorted by name descending order
   * when Object ?sort[name]=desc,sort[age]=asc {name: 'desc', age: 'asc'} it is sorted by name desc and age asc order
   *
   * @return {Object} get the sort property
   */
  get sort(): any {
    const output: any[] = [];
    if (this._sort) {
      console.log(this._sort);
      if (!_.isObject(this._sort)) {
        try {
          this._sort = JSON.parse(this._sort);
        } catch (e) {
          return { [this._sort]: 1 };
        }
      }
      console.log('sort', this._sort);
      for (const [column, direction] of Object.entries(this._sort)) {
        if (_.isString(direction)) {
          output.push([column, direction]);
        }
      }
      
      return { 'order': output };
    }
    console.log('no sort');
    return { createdAt: -1 };
  }

  /**
   * @return {Boolean} get the value for all data request
   */
  get getAll(): boolean {
    return this._all;
  }

  /**
   *  Initialise all the special object required for the find query
   *  @param {Object} query This is a query object of the request
   */
  initialize(query: any): void {
    this._all = query.all;
    this._sort = query.sort;
    console.log(this.sort);
    if (query.population) {
      this.population = query.population;
    }
    if (query.selection) {
      this.selection = query.selection;
    }
    if (query.search) {
      this._search = query.search;
    }
    if (query.nested) {
      this._query = { ...this._query, ...this.processNestedQuery(query) };
    }
    if (query.regex) {
      this._query = { ...this._query, ...this.processRegSearch(query) };
    }
  }

  /**
   * @param {Object} query is the population object
   * @return {Object} get the parsed query
   */
  processNestedQuery(query: any): any {
    let value = query.nested;
    let result: any = {};
    if (value) {
      try {
        value = JSON.parse(value.toString());
        for (const filter of value) {
          if (filter.hasOwnProperty('key') && filter.hasOwnProperty('value')) {
            if (filter.value.in_array) {
              filter.value = { $in: filter.value.in_array };
            }
            result[filter.key] = filter.value;
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * @param {Object} query is the population object
   * @return {Object} get the parsed query
   */
  processRegSearch(query: any): any {
    const value = query.regex;
    const result: any = {};
    if (!_.isObject(value)) {
      try {
        const regex = JSON.parse(value.toString());
        for (const r of regex) {
          const q = new RegExp(r.value);
          result[r.key] = { $regex: q, $options: 'i' };
        }
      } catch (e) {
        console.log(e);
      }
    }
    return result;
  }

  /**
   * Get query object for database
   */
  getQueryObject(): any {
    return {
      where: this._query,
      orderBy: this.sort,
      limit: 10,
      offset: 0
    };
  }
} 