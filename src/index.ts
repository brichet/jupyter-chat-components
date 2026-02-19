import { IRenderMime } from '@jupyterlab/rendermime-interfaces';

import { nullTranslator, TranslationBundle } from '@jupyterlab/translation';

import { Widget } from '@lumino/widgets';

import {
  buildToolCallHtml,
  IToolCallHtmlOptions,
  ToolCallApproval,
  ToolStatus
} from './tool-call';

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'application/vnd.jupyter.chat.components';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'jp-RenderedComponents';

interface IComponentsRendererOptions extends IRenderMime.IRendererOptions {
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
        toolName: metadata.toolName as string,
        input: metadata.input as string,
        status: metadata.status as ToolStatus,
        summary: (metadata.summary as string) ?? undefined,
        output: (metadata.output as string) ?? undefined,
        targetId: (metadata.targetId as string) ?? undefined,
        approvalId: (metadata.approvalId as string) ?? undefined,
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

export interface IComponentsRendererFactory extends IRenderMime.IRendererFactory {
  toolCallApproval: ToolCallApproval;
}
/**
 * A mime renderer factory for  data.
 */
class RendererFactory implements IComponentsRendererFactory {
  readonly safe = true;
  readonly mimeTypes = [MIME_TYPE];
  toolCallApproval: ToolCallApproval = null;
  createRenderer = (options: IRenderMime.IRendererOptions) => {
    return new ComponentsRenderer({ ...options, toolCallApproval: this.toolCallApproval });
  }
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyter-ai-chat-components:plugin',
  // description: 'Adds MIME type renderer for  content',
  rendererFactory: new RendererFactory(),
  rank: 100,
  dataType: 'string'
};

export default extension;
