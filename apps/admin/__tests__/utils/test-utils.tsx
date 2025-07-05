import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime'
import { NextRouter } from 'next/router'

// Mock router
export function createMockRouter(router: Partial<NextRouter> = {}): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '/',
    asPath: '/',
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
    ...router,
  }
}

// Custom render function with providers
export function renderWithRouter(
  ui: ReactElement,
  {
    router = createMockRouter(),
    ...renderOptions
  }: RenderOptions & { router?: NextRouter } = {}
) {
  return render(
    <RouterContext.Provider value={router}>
      {ui}
    </RouterContext.Provider>,
    renderOptions
  )
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithRouter as render }