import $, { Event } from './node';
import language from '../locales';
import { EventInterface, NodeInterface, Selector } from '../types/node';
import schemaDefaultData from '../constants/schema';
import Schema from '../parser/schema';
import Conversion from '../parser/conversion';
import {
  ContentViewInterface,
  ContentViewOptions,
} from '../types/content-view';
import { CardModelInterface } from '../types/card';
import { PluginModelInterface } from '../types/plugin';
import { SchemaInterface } from '../types/schema';
import { ConversionInterface } from '../types/conversion';
import CardModel from './card';
import PluginModel from './plugin';
import { ClipboardInterface } from '../types/clipboard';
import Clipboard from './clipboard';
import { LanguageInterface } from '../types/language';
import Language from './language';
import Parser from '../parser';
import EngineModel from './engine';

class ContentView implements ContentViewInterface {
  private options: ContentViewOptions = {
    lang: 'zh-cn',
  };
  language: LanguageInterface;
  container: NodeInterface;
  card: CardModelInterface;
  plugin: PluginModelInterface;
  clipboard: ClipboardInterface;
  event: EventInterface;
  schema: SchemaInterface;
  conversion: ConversionInterface;

  constructor(selector: Selector, options?: ContentViewOptions) {
    this.options = { ...this.options, ...options };
    this.language = new Language(language[this.options.lang || 'zh-cn']);
    this.container = $(selector);
    this.container.addClass('am-engine-view');
    this.event = new Event();
    this.schema = new Schema();
    this.schema.add(schemaDefaultData);
    this.conversion = new Conversion();
    this.card = new CardModel();
    this.card.setContentView(this);
    const cardClasses = (this.options.card || EngineModel.card).classes;
    Object.keys(cardClasses).forEach(name => {
      this.card.add(name, cardClasses[name]!);
    });

    this.plugin = new PluginModel();
    this.plugin.setContentView(this);
    (this.options.plugin || EngineModel.plugin).each((name, clazz) => {
      this.plugin.add(name, clazz);
      const plugin = new clazz(name, {
        contentView: this,
      });
      this.plugin.components[name] = plugin;
      if (plugin.schema) this.schema.add(plugin.schema());
      if (plugin.locales) this.language.add(plugin.locales());
    });
    this.clipboard = new Clipboard(undefined, this);
  }

  render(content: string) {
    const parser = new Parser(content, undefined, this);
    const value = parser.toValue(
      this.schema.getValue(),
      undefined,
      false,
      true,
    );
    this.container.html(value);
    this.card.render();
  }

  messageSuccess(message: string) {
    console.log(`success:${message}`);
  }

  messageError(error: string) {
    console.log(`error:${error}`);
  }
}

export default ContentView;