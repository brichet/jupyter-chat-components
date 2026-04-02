import * as React from 'react';

import {
  IComponentProps,
  IMessageQueueMetadata,
  RemoveQueuedMessage
} from '../token';

/**
 * Props for the MessageQueue component.
 */
export interface IMessageQueueProps
  extends IComponentProps, IMessageQueueMetadata {
  removeQueuedMessage?: RemoveQueuedMessage;
}

/**
 * React component that displays a list of queued messages by
 * showing each pending message as a bubble in the chat
 */
export const MessageQueue: React.FC<IMessageQueueProps> = ({
  messages,
  targetId,
  trans,
  removeQueuedMessage
}) => {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="jp-chat-message-queue">
      {messages.map(msg => (
        <div key={msg.id} className="jp-chat-message-queue-bubble">
          <span className="jp-chat-message-queue-text">{msg.body}</span>
          {removeQueuedMessage && targetId && (
            <button
              className="jp-chat-message-queue-remove"
              onClick={() => removeQueuedMessage(targetId, msg.id)}
              title={trans.__('Remove from queue')}
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
