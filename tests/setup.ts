import { beforeAll, afterEach, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './msw/handlers'

export const server = setupServer(...handlers)

// External requests must be mocked, but tests also boot a local Express server
// and call it over HTTP; those loopback requests are not MSW's concern.
beforeAll(() =>
  server.listen({
    onUnhandledRequest(request, print) {
      const { hostname } = new URL(request.url)
      if (hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1') return
      print.error()
    },
  }),
)
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
