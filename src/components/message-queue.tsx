import * as React from 'react';
import { useEffect, useRef } from 'react';

import {
  IComponentProps,
  IMessageQueueMetadata,
  RemoveQueuedMessage
} from '../token';

/**
 * Props for the MessageQueue component.
 */
export interface IMessageQueueProps
  extends IComponentProps,
    IMessageQueueMetadata {
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Find the parent Jupyter chat message container and make it sticky
      // This is a bit too adhoc but works for now
      const msgWrapper = containerRef.current.closest('.jp-chat-message') as HTMLElement;
      if (msgWrapper) {
        msgWrapper.style.position = 'sticky';
        msgWrapper.style.bottom = '10px';
        msgWrapper.style.zIndex = '10';
        msgWrapper.style.pointerEvents = 'none';
      }
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="jp-chat-message-queue" ref={containerRef}>
      {messages.map(msg => (
        <div
          key={msg.id}
          className="jp-chat-message-queue-bubble"
          title={msg.body}
        >
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
