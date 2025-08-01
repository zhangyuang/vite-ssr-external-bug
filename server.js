import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isTest = process.env.VITEST

export async function createServer(
  root = process.cwd(),

) {
  const clientConfig = {
    root,
    logLevel: 'error',
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  }

  const serverConfig = {
    root,
    logLevel: 'error',
    server: {
      middlewareMode: true,
    },
    appType: 'custom',
  }
  const resolve = (p) => path.resolve(__dirname, p)

  const app = express()
  const { createServer } = await import('vite')
  const clientDevServer = await createServer(clientConfig)
  const serverDevServer = await createServer(serverConfig)
  // use vite's connect instance as middleware
  app.use(clientDevServer.middlewares)

  app.use('*all', async (req, res, next) => {
    const url = req.originalUrl

    let template
    template = fs.readFileSync(resolve('index.html'), 'utf-8')
    template = await clientDevServer.transformIndexHtml(url, template)
    const render = (await serverDevServer.ssrLoadModule('/src/app.js')).render

    const appHtml = await render(url, __dirname)

    const html = template.replace(`<!--app-html-->`, appHtml)

    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  })

  return { app }
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(5173, () => {
      console.log('http://localhost:5173')
    }),
  )
}
