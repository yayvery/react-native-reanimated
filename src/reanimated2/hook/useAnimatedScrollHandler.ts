import type { DependencyList, NativeEvent } from './commonTypes';
import { useHandler } from './useHandler';
import { useEvent } from './useEvent';
import type { NativeScrollEvent } from 'react-native';

export interface ScrollEventPayload extends NativeScrollEvent {
  eventName: string;
}

export type ScrollEvent = NativeEvent<ScrollEventPayload>;

export type ScrollHandler<
  Context extends Record<string, unknown> = Record<string, unknown>
> = (event: NativeEvent<ScrollEventPayload>, context: Context) => void;
export interface ScrollHandlers<Context extends Record<string, unknown>> {
  onScroll?: ScrollHandler<Context>;
  onBeginDrag?: ScrollHandler<Context>;
  onEndDrag?: ScrollHandler<Context>;
  onMomentumBegin?: ScrollHandler<Context>;
  onMomentumEnd?: ScrollHandler<Context>;
}

export function useAnimatedScrollHandler<
  Context extends Record<string, unknown>
>(
  handlers: ScrollHandlers<Context> | ScrollHandler<Context>,
  dependencies?: DependencyList
): ScrollHandler<Context> {
  // case when handlers is a function
  const scrollHandlers: ScrollHandlers<Context> =
    typeof handlers === 'function' ? { onScroll: handlers } : handlers;
  const { context, doDependenciesDiffer } = useHandler<
    ScrollEventPayload,
    Context
  >(scrollHandlers as Record<string, ScrollHandler<Context>>, dependencies);

  // build event subscription array
  const subscribeForEvents = ['onScroll'];
  if (scrollHandlers.onBeginDrag !== undefined) {
    subscribeForEvents.push('onScrollBeginDrag');
  }
  if (scrollHandlers.onEndDrag !== undefined) {
    subscribeForEvents.push('onScrollEndDrag');
  }
  if (scrollHandlers.onMomentumBegin !== undefined) {
    subscribeForEvents.push('onMomentumScrollBegin');
  }
  if (scrollHandlers.onMomentumEnd !== undefined) {
    subscribeForEvents.push('onMomentumScrollEnd');
  }

  return useEvent<ScrollEventPayload>(
    (event: NativeEvent<ScrollEventPayload>) => {
      'worklet';
      const {
        onScroll,
        onBeginDrag,
        onEndDrag,
        onMomentumBegin,
        onMomentumEnd,
      } = scrollHandlers;
      if (onScroll && event.eventName.endsWith('onScroll')) {
        onScroll(event, context);
      } else if (onBeginDrag && event.eventName.endsWith('onScrollBeginDrag')) {
        onBeginDrag(event, context);
      } else if (onEndDrag && event.eventName.endsWith('onScrollEndDrag')) {
        onEndDrag(event, context);
      } else if (
        onMomentumBegin &&
        event.eventName.endsWith('onMomentumScrollBegin')
      ) {
        onMomentumBegin(event, context);
      } else if (
        onMomentumEnd &&
        event.eventName.endsWith('onMomentumScrollEnd')
      ) {
        onMomentumEnd(event, context);
      }
    },
    subscribeForEvents,
    doDependenciesDiffer
  );
}
