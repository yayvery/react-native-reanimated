import {
  WEB_ANIMATIONS_ID,
  generateRandomKeyframeName,
  setElementAnimation,
} from './webAnimations';

import type { AnimationConfig } from './webAnimations';

export enum TransitionType {
  LINEAR,
  SEQUENCED,
  FADING,
}

export interface TransitionConfig {
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  reversed?: boolean;
}

function LinearTransition(name: string, transitionConfig: TransitionConfig) {
  const { translateX, translateY, scaleX, scaleY } = transitionConfig;

  return `@keyframes ${name} {
                  0% {
                    transform: translateX(${translateX}px) translateY(${translateY}px) scale(${scaleX},${scaleY});
                  }
                }`;
}

function SequencedTransition(name: string, transitionConfig: TransitionConfig) {
  const { translateX, translateY, scaleX, scaleY, reversed } = transitionConfig;

  const translate = `translate${reversed ? 'X' : 'Y'}(${
    reversed ? translateX : translateY
  }px)`;
  const scaleValue = reversed ? `1, ${scaleX}` : `${scaleY}, 1`;

  // TODO: Change proportions
  return `@keyframes ${name} {
                0% {
                  transform: translateX(${translateX}px) translateY(${translateY}px) scale(${scaleX}, ${scaleY});
                }
                50% {
                  transform: ${translate} scale(${scaleValue});
                }
                100% {
                  transform: translateX(0) translateY(0) scale(1,1);
                }
              }`;
}

function FadingTransition(name: string, transitionConfig: TransitionConfig) {
  const { translateX, translateY, scaleX, scaleY } = transitionConfig;

  return `@keyframes ${name} {
                0% {
                  opacity: 1;
                  transform: translateX(${translateX}px) translateY(${translateY}px) scale(${scaleX}, ${scaleY});
                }
                20%{
                  opacity: 0;
                  transform: translateX(${translateX}px) translateY(${translateY}px) scale(${scaleX}, ${scaleY});
                }
                60% {
                  opacity: 0;
                  transform: translateX(0) translateY(0) scale(1,1);
                }
                100% {
                  opacity: 1;
                  transform: translateX(0) translateY(0) scale(1,1);
                }
              }`;
}

/**
 * Creates transition of given type, appends it to stylesheet and returns keyframe name.
 *
 * @param transitionType Type of transition (e.g. LINEAR).
 * @param transitionConfig Object containing data for transforms (translateX, scaleX,...).
 * @returns Keyframe name that represents transition.
 */
export function TransitionGenerator(
  transitionType: TransitionType,
  transitionConfig: TransitionConfig
) {
  const keyframe = generateRandomKeyframeName();
  let transition;

  switch (transitionType) {
    case TransitionType.LINEAR:
      transition = LinearTransition(keyframe, transitionConfig);
      break;
    case TransitionType.SEQUENCED:
      transition = SequencedTransition(keyframe, transitionConfig);
      break;
    case TransitionType.FADING:
      transition = FadingTransition(keyframe, transitionConfig);
      break;
  }

  const styleTag = document.getElementById(
    WEB_ANIMATIONS_ID
  ) as HTMLStyleElement;

  styleTag.sheet?.insertRule(transition);

  return keyframe;
}

export function handleLayoutTransition(
  element: HTMLElement,
  animationConfig: AnimationConfig,
  transitionConfig: TransitionConfig
) {
  const { animationName } = animationConfig;

  let animationType;

  switch (animationName) {
    case 'LinearTransition':
      animationType = TransitionType.LINEAR;
      break;
    case 'SequencedTransition':
      animationType = TransitionType.SEQUENCED;
      break;
    case 'FadingTransition':
      animationType = TransitionType.FADING;
      break;
    default:
      animationType = TransitionType.LINEAR;
      break;
  }

  animationConfig.animationName = TransitionGenerator(
    animationType,
    transitionConfig
  );

  setElementAnimation(element, animationConfig);
}
