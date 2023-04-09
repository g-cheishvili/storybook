import type { ComponentProps } from 'react';
import React, { useRef, useState } from 'react';
import { IconButton, Icons } from '@storybook/components';
import { Consumer } from '@storybook/manager-api';
import type { Addon, Combo } from '@storybook/manager-api';
import { styled } from '@storybook/theming';
import { FORCE_REMOUNT } from '@storybook/core-events';

interface AnimatedButtonProps {
  animating?: boolean;
}

const StyledAnimatedIconButton = styled(IconButton)<
  AnimatedButtonProps & ComponentProps<typeof IconButton>
>(({ theme, animating, disabled }) => ({
  opacity: disabled ? 0.5 : 1,
  svg: {
    animation: animating && `${theme.animation.rotate360} 1000ms ease-out`,
  },
}));

const menuMapper = ({ api, state }: Combo) => {
  const { storyId } = state;
  return {
    storyId,
    remount: () => api.emit(FORCE_REMOUNT, { storyId: state.storyId }),
    api,
  };
};

export const remountTool: Addon = {
  title: 'remount',
  id: 'remount',
  match: ({ viewMode }) => viewMode === 'story',
  render: () => (
    <Consumer filter={menuMapper}>
      {({ remount, storyId, api }) => {
        const [isAnimating, setIsAnimating] = useState(false);
        const remountComponent = () => {
          if (!storyId) return;
          remount();
        };

        api.on(FORCE_REMOUNT, () => {
          setIsAnimating(true);
        });

        return (
          <StyledAnimatedIconButton
            key="remount"
            title="Remount component"
            onClick={remountComponent}
            onAnimationEnd={() => setIsAnimating(false)}
            animating={isAnimating}
            disabled={!storyId}
          >
            <Icons icon="sync" />
          </StyledAnimatedIconButton>
        );
      }}
    </Consumer>
  ),
};
