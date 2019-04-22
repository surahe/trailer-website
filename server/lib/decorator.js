const Router = require('koa-router')
const glob = require('glob')
const {resolve} = require('path')
const _ = require('lodash')

const symbolPrefix = Symbol('prefix')
const routerMap = new Map()

const isArray = c => _.isArray(c) ? c : [c]

export class Route {
  constructor (app, apiPath) {
    this.app = app
    this.apiPath = apiPath
    this.router = new Router()
  }

  init () {
    glob.sync(resolve(this.apiPath, '**/*.js')).forEach(require)
    for (let [conf, controller] of routerMap) {
      const controllers = isArray(controller)
      let prefixPath = conf.target[symbolPrefix]
      if (prefixPath) prefixPath = normalizePath(prefixPath)
      const routerPath = prefixPath + conf.path
      this.router[conf.method](routerPath, ...controllers)
    }

    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
  }
}

// path前没有 / 则添加 /
const normalizePath = path => path.startsWith('/') ? path : `/${path}`

// 
/**
 *  在routerMap添加键值对，格式如下：
  Map {
  { target: movieController { [Symbol(prefix)]: '/api/v0/movies' },
    method: 'get',
    path: '/' } => [Function: getMovies],
  { target: movieController { [Symbol(prefix)]: '/api/v0/movies' },
    method: 'get',
    path: '/:id' } => [Function: getMovieDetail],
  { target: userController { [Symbol(prefix)]: '/api/v0/user' },
    method: 'post',
    path: '/' } => [Function: login] }
 */
const router = conf => (target, key, descriptor) => {
  conf.path = normalizePath(conf.path)

  routerMap.set({
    target,
    ...conf
  }, target[key])
}

// 装饰constroller，在Controller的prototype属性创建唯一属性symbolPrefix
export const controller = path => target => (target.prototype[symbolPrefix] = path)

// 修饰Controller的方法，执行router函数
export const get = path => router({
  method: 'get',
  path: path
})

export const post = path => router({
  method: 'post',
  path: path
})

export const put = path => router({
  method: 'put',
  path: path
})

export const del = path => router({
  method: 'delete',
  path: path
})

export const use = path => router({
  method: 'use',
  path: path
})

export const all = path => router({
  method: 'all',
  path: path
})