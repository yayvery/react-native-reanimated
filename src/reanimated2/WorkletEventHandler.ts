import type { NativeSyntheticEvent } from 'react-native';
import NativeReanimatedModule from './NativeReanimated';
import { registerEventHandler, unregisterEventHandler } from './core';
import type { EventPayload, ReanimatedEvent } from './hook/commonTypes';

type AssertNativeEvent<Event extends object> = NativeSyntheticEvent<
  EventPayload<Event>
>;

// In JS implementation (e.g. for web) we don't use Reanimated's
// event emitter therefore we have to handle here
// the event that came from React Native and convert it.
function jsListener<Event extends object>(
  eventName: string,
  handler: (event: ReanimatedEvent<Event>) => void
) {
  return (evt: AssertNativeEvent<Event>) => {
    handler({ ...evt.nativeEvent, eventName } as ReanimatedEvent<Event>);
  };
}

export default class WorkletEventHandler<Event extends object> {
  worklet: (event: ReanimatedEvent<Event>) => void;
  eventNames: string[];
  reattachNeeded: boolean;
  listeners:
    | Record<string, (event: ReanimatedEvent<ReanimatedEvent<Event>>) => void>
    | Record<string, (event: AssertNativeEvent<Event>) => void>;

  viewTag: number | undefined;
  registrations: number[];
  constructor(
    worklet: (event: ReanimatedEvent<Event>) => void,
    eventNames: string[] = []
  ) {
    this.worklet = worklet;
    this.eventNames = eventNames;
    this.reattachNeeded = false;
    this.listeners = {};
    this.viewTag = undefined;
    this.registrations = [];

    if (!NativeReanimatedModule.native) {
      this.listeners = eventNames.reduce(
        (
          acc: Record<string, (event: AssertNativeEvent<Event>) => void>,
          eventName: string
        ) => {
          acc[eventName] = jsListener(eventName, worklet);
          return acc;
        },
        {}
      );
    }
  }

  updateWorklet(newWorklet: (event: ReanimatedEvent<Event>) => void): void {
    this.worklet = newWorklet;
    this.reattachNeeded = true;
  }

  registerForEvents(viewTag: number, fallbackEventName?: string): void {
    this.viewTag = viewTag;
    this.registrations = this.eventNames.map((eventName) =>
      registerEventHandler(this.worklet, eventName, viewTag)
    );
    if (this.registrations.length === 0 && fallbackEventName) {
      this.registrations.push(
        registerEventHandler(this.worklet, fallbackEventName, viewTag)
      );
    }
  }

  registerForEventByName(eventName: string) {
    this.registrations.push(registerEventHandler(this.worklet, eventName));
  }

  unregisterFromEvents(): void {
    this.registrations.forEach((id) => unregisterEventHandler(id));
    this.registrations = [];
  }
}
