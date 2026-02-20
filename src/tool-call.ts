import { TranslationBundle } from '@jupyterlab/translation';

/**
 * The callback to approve or reject a tool.
 */
export type ToolCallApproval =
  | ((targetId: string, approvalId: string, approve: boolean) => void)
  | null;

/**
 * Tool call status types.
 */
export type ToolStatus =
  | 'pending'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'error';

/**
 * Configuration for rendering tool call status.
 */
interface IStatusConfig {
  cssClass: string;
  statusClass: string;
  open?: boolean;
}

const STATUS_CONFIG: Record<ToolStatus, IStatusConfig> = {
  pending: {
    cssClass: 'jp-ai-tool-pending',
    statusClass: 'jp-ai-tool-status-pending'
  },
  awaiting_approval: {
    cssClass: 'jp-ai-tool-pending',
    statusClass: 'jp-ai-tool-status-approval',
    open: true
  },
  approved: {
    cssClass: 'jp-ai-tool-pending',
    statusClass: 'jp-ai-tool-status-completed'
  },
  rejected: {
    cssClass: 'jp-ai-tool-error',
    statusClass: 'jp-ai-tool-status-error'
  },
  completed: {
    cssClass: 'jp-ai-tool-completed',
    statusClass: 'jp-ai-tool-status-completed'
  },
  error: {
    cssClass: 'jp-ai-tool-error',
    statusClass: 'jp-ai-tool-status-error'
  }
};

/**
 * Options for building tool call HTML.
 */
export interface IToolCallHtmlOptions {
  toolName: string;
  input: string;
  status: ToolStatus;
  summary?: string;
  output?: string;
  targetId?: string;
  approvalId?: string;
  trans: TranslationBundle;
  toolCallApproval: ToolCallApproval;
}

export function escapeHtml(value: string): string {
  // Prefer the same native escaping approach used in JupyterLab itself
  // (e.g. `@jupyterlab/completer`).
  if (typeof document !== 'undefined') {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }

  // Fallback
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns the translated status text for a given tool status.
 */
const getStatusText = (
  status: ToolStatus,
  trans: TranslationBundle
): string => {
  switch (status) {
    case 'pending':
      return trans.__('Running...');
    case 'awaiting_approval':
      return trans.__('Awaiting Approval');
    case 'approved':
      return trans.__('Approved - Executing...');
    case 'rejected':
      return trans.__('Rejected');
    case 'completed':
      return trans.__('Completed');
    case 'error':
      return trans.__('Error');
  }
};

/**
 * Builds HTML for a tool call display.
 */
export function buildToolCallHtml(
  options: IToolCallHtmlOptions
): HTMLDetailsElement {
  const {
    toolName,
    input,
    status,
    summary,
    output,
    targetId,
    approvalId,
    trans
  } = options;
  const config = STATUS_CONFIG[status];
  const statusText = getStatusText(status, trans);
  const escapedToolName = escapeHtml(toolName);
  const escapedInput = escapeHtml(input);

  const details = document.createElement('details');
  details.classList.add('jp-ai-tool-call', config.cssClass);
  if (config.open) {
    details.setAttribute('open', 'true');
  }

  const summaryElement = document.createElement('summary');
  summaryElement.classList.add('jp-ai-tool-header');

  // Build summary header
  const icon = document.createElement('div');
  icon.classList.add('jp-ai-tool-icon');
  icon.textContent = '⚡';

  const title = document.createElement('div');
  title.classList.add('jp-ai-tool-title');
  title.textContent = escapedToolName;

  if (summary) {
    const summarySpan = document.createElement('span');
    summarySpan.classList.add('jp-ai-tool-summary');
    summarySpan.textContent = summary;
    title.appendChild(summarySpan);
  }

  const statusDiv = document.createElement('div');
  statusDiv.classList.add('jp-ai-tool-status', config.statusClass);
  statusDiv.textContent = statusText;

  summaryElement.appendChild(icon);
  summaryElement.appendChild(title);
  summaryElement.appendChild(statusDiv);

  // Build body
  const body = document.createElement('div');
  body.classList.add('jp-ai-tool-body');

  // Add input section
  const inputSection = document.createElement('div');
  inputSection.classList.add('jp-ai-tool-section');

  const inputLabel = document.createElement('div');
  inputLabel.classList.add('jp-ai-tool-label');
  inputLabel.textContent = trans.__('Input');

  const inputPre = document.createElement('pre');
  inputPre.classList.add('jp-ai-tool-code');

  const inputCode = document.createElement('code');
  inputCode.textContent = escapedInput;

  inputPre.appendChild(inputCode);
  inputSection.appendChild(inputLabel);
  inputSection.appendChild(inputPre);
  body.appendChild(inputSection);

  // Add approval buttons if awaiting approval
  if (status === 'awaiting_approval' && approvalId && targetId) {
    const approvalButtonsDiv = document.createElement('div');
    approvalButtonsDiv.classList.add(
      'jp-ai-tool-approval-buttons',
      `jp-ai-approval-id--${approvalId}`
    );

    const approveBtn = document.createElement('button');
    approveBtn.classList.add('jp-ai-approval-btn', 'jp-ai-approval-approve');
    approveBtn.textContent = trans.__('Approve');

    const rejectBtn = document.createElement('button');
    rejectBtn.classList.add('jp-ai-approval-btn', 'jp-ai-approval-reject');
    rejectBtn.textContent = trans.__('Reject');

    approvalButtonsDiv.appendChild(approveBtn);
    approvalButtonsDiv.appendChild(rejectBtn);
    body.appendChild(approvalButtonsDiv);

    approveBtn.addEventListener('click', () =>
      options.toolCallApproval?.(targetId, approvalId, true)
    );
    rejectBtn.addEventListener('click', () =>
      options.toolCallApproval?.(targetId, approvalId, false)
    );
  }

  // Add output/result section if provided
  if (output !== undefined) {
    const escapedOutput = escapeHtml(output);
    const label = status === 'error' ? trans.__('Error') : trans.__('Result');

    const outputSection = document.createElement('div');
    outputSection.classList.add('jp-ai-tool-section');

    const outputLabel = document.createElement('div');
    outputLabel.classList.add('jp-ai-tool-label');
    outputLabel.textContent = label;

    const outputPre = document.createElement('pre');
    outputPre.classList.add('jp-ai-tool-code');

    const outputCode = document.createElement('code');
    outputCode.textContent = escapedOutput;

    outputPre.appendChild(outputCode);
    outputSection.appendChild(outputLabel);
    outputSection.appendChild(outputPre);
    body.appendChild(outputSection);
  }

  details.appendChild(summaryElement);
  details.appendChild(body);

  return details;
}
