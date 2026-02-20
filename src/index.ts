import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IRenderMimeRegistry } from '@jupyterlab/rendermime';

import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { nullTranslator, TranslationBundle } from '@jupyterlab/translation';

import { Widget } from '@lumino/widgets';

import {
  IComponentsRendererFactory,
  IToolCallMetadata,
  ToolCallApproval
} from './token';

import { buildToolCallHtml, IToolCallHtmlOptions } from './tool-call';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/vnd.jupyter.chat.components';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'jp-RenderedChatComponents';

/**
 * The options for the chat components renderer.
 */
interface IComponentsRendererOptions extends IRenderMime.IRendererOptions {
  /**
   * The callback to approve or reject a tool.
   */
  toolCallApproval: ToolCallApproval;
}

/**
 * A widget for rendering .
 */
export class ComponentsRenderer
  extends Widget
  implements IRenderMime.IRenderer
{
  /**
   * Construct a new output widget.
   */
  constructor(options: IComponentsRendererOptions) {
    super();
    this._trans = (options.translator ?? nullTranslator).load('jupyterlab');
    this._mimeType = options.mimeType;
    this._toolCallApproval = options.toolCallApproval;
    this.addClass(CLASS_NAME);
  }

  /**
   * Render  into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    const data = model.data[this._mimeType] as string;
    const metadata = { ...model.metadata };
    if (data === 'tool-call') {
      const toolCallOptions: IToolCallHtmlOptions = {
        ...(metadata as unknown as IToolCallMetadata),
        trans: this._trans,
        toolCallApproval: this._toolCallApproval
      };
      this.node.appendChild(buildToolCallHtml(toolCallOptions));
    }
    return Promise.resolve();
  }

  private _trans: TranslationBundle;
  private _mimeType: string;
  private _toolCallApproval: ToolCallApproval;
}

/**
 * A mime renderer factory for chat components.
 */
class RendererFactory implements IComponentsRendererFactory {
  readonly safe = true;
  readonly mimeTypes = [MIME_TYPE];
  readonly defaultRank = 100;
  toolCallApproval: ToolCallApproval = null;
  createRenderer = (options: IRenderMime.IRendererOptions) => {
    return new ComponentsRenderer({
      ...options,
      toolCallApproval: this.toolCallApproval
    });
  };
}

const plugin: JupyterFrontEndPlugin<IComponentsRendererFactory> = {
  id: 'jupyter-chat-components:plugin',
  description: 'Adds MIME type renderer for chat components',
  autoStart: true,
  provides: IComponentsRendererFactory,
  requires: [IRenderMimeRegistry],
  activate: (
    app: JupyterFrontEnd,
    rendermime: IRenderMimeRegistry
  ): IComponentsRendererFactory => {
    const rendererFactory = new RendererFactory();
    rendermime.addFactory(rendererFactory);
    return rendererFactory;
  }
};

export * from './token';
export default plugin;
