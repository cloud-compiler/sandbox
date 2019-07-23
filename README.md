# Cloud Compiler 云编译系统

它是由nodejs(typescript)编写，主要解决在线编译的问题。可以通过增加loader对不同语言的项目进行编译。同时可以通过增加插件来进行后续的上传整理工作。它是一套符合前端开发者使用的云编译工具。

程序基于[NELTS](https://github.com/nelts)架构实现，有着稳定的性能。感兴趣的小伙伴可以前往链接查看。

# 前提

它依赖 [pm2](https://www.npmjs.com/package/pm2) 进程守护，请优先安装：

```bash
$ npm i -g pm2
$ pm2 install pm2-intercom
```

# 快速安装

您不必为安装烦恼，`NILPPM`提供最便捷的安装模式和升级模式，请跟着我们的步骤操作即可完成安装。

```bash
$ git clone git@github.com:cloud-compiler/repository.git
$ cd repository
$ rm -rf .git
$ npm ci
```

> 依赖安装完毕请修改配置文件 `compile.config.js`。具体配置参数说明见`手动安装`文档。

# 手动安装

手动安装过程页非常方便，请按照以下步骤进行。

## 第一步

确定您存放私有包的目录，比如我们存放在`/usr/local/repo`路径上。那么：

```bash
$ cd /usr/local/repo
```

## 第二步

创建一个`package.json`来描述这个仓库程序。

```bash
$ npm init
```

比如我们创建了如下的信息

```json
{
  "name": "repo",
  "version": "1.0.0",
  "description": "",
  "main": "compile.config.js",
  "author": "",
  "license": "ISC"
}
```

## 第三步

安装我们的程序包，通过NPM直接安装

```bash
$ npm i @cloud-compiler/sandbox
```

## 第四步

在`package.json`中写入命令

```json
{
  // ...
  "scripts": {
    "start": "cc start -p 9047 && pm2 logs",
    "restart": "cc restart",
    "stop": "cc stop"
  },
  // ...
}
```

这里的`start`命令参数：

- `-m, --max <count>` 启动时候子进程个数。
- `-p, --port <port>` 启动服务的端口。
- `-l, --level <level>` 日志级别

它是基于[PM2](https://www.npmjs.com/package/pm2)守护进程的，所以能够使用`PM2`的所有命令。关于日志级别，请参考 [这里](https://github.com/nelts/nelts/blob/master/docs/introduction/dir.md#%E6%A0%B9%E7%9B%AE%E5%BD%95)

## 第五步

写入配置参数

在当前目录下新建一个`compile.config.js`文件，写入如下的配置

```javascript
const Compiler = require('@cloud-compiler/sandbox');
module.exports = {
  html5: {
    loader: Compiler.HTML5Compiler
  }
}
```

`compile.config.js`文件的结构如下：

```ts
interface PluginLoader<T extends CompileDataType> {
  [name: string]: {
    loader: CustomCompiler<T> | string,
    plugins: (string | Compose.Middleware<CustomCompiler<T>>)[],
  }
}
```

- `loader` 用来处理语言是如何编译的。
- `plugins` 用来对编译后的产生的`dest`目录进行自定义处理。它可以是一个字符串(当作模块包处理，将使用`require`获取对象)，也可以是一个插件对象数组。你可以简单的认为插件对象是一个中间件形式的。

**loader编写：**

我们可以参考 [html5.ts](https://github.com/cloud-compiler/sandbox/blob/master/src/compiler/html5.ts) 模块来编写。

**插件编写：**

```ts
import { CustomCompiler } from '@cloud-compiler/sandbox';
export default async (ctx: CustomCompiler, next: Function) => {
  // ctx.dest 就是编译后的文件夹
  await next();
}
```

## 第六步

通过以下命令启动

```bash
$ npm run start # 启动
$ npm run restart # 重启
$ npm run stop # 停止
```

# 更新

更新方式变的非常简单

```bash
$ npm update # 更新程序
$ npm run restart # 重启服务
```

# 调用

假设我们所启动的服务在 `http://cc.example.com` 上。我们需要编译H5项目。

## 注册任务

- **路由** `http://cc.example.com/task/${task_id}`
- **方法** `PUT`
- **BODY参数** 如下：

```js
{
  "type": "html5",
  "repo": {
    "url": "资源包URL地址，gitlab和github都由公开的资源包地址。",
    "headers": {
      "Private-Token": "私有key的值"
    }
  },
  "configs": {
    "installCommander": "cpm ci", // 安装依赖命令
    "buildCommander": "npm run build", // 编译项目命令
    "buildDistDictionary": "dist", // 项目编译后存放的文件夹名
    "dynamicArgumentsName": ".deploy.json", // 动态注入参数将生成一个文件，这里就是指这个文件的命令。
    "dynamicArgumentsData": { // 动态注入的参数，它将会将此数据生成一个响应的文件。
      "login_url": "http://xxxx.xxx.cn",
      "sign": "xxxx",
      // ...
    }
  }
}
```

请求将返回该任务的详细信息。其中有个`socketPort`字段，你可以直接使用`socket.io-client`链接这个端口来实时获取编译信息。

## 启动编译

- **路由** `http://cc.example.com/task/${task_id}`
- **方法** `POST`
- **BODY参数** 无


## 停止编译

- **路由** `http://cc.example.com/task/${task_id}`
- **方法** `DELETE`

## 获取健康状态

- **路由** `http://cc.example.com`
- **方法** `GET`

你可以实时看到由多少任务在执行。

# License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, yunjie (Evio) shen
