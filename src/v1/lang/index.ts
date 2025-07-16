import _ from 'lodash';
import en from './en';

// Simulate config.get('api.lang')
const language = 'en';

function get(this: any, prop: string) {
  if (this.hasOwnProperty(prop)) return this[prop];
  else throw new Error(`There's no property defined as ${prop} in your translations`);
}

const lang: any = { get };

const obj: any = en;
_.each(Object.getOwnPropertyNames(obj), (property) => {
  lang[property] = Object.assign({}, obj[property], { get });
});

export default lang; 