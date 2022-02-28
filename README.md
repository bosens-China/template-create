# create-template

创建模板文件的脚手架工具

## 使用方式

```sh
# npm
npm init @boses
# yarn
yarn create @boses
# pnpm
pnpm create @boses
```

然后根据命令一步步操作即可，如果你厌倦了上面的一步步操作，也可以通过指定类别来完成快速操作

```sh
# npm
npm init @boses my-app --templat=base
# yarn
yarn create @boses my-app --templat=base
# pnpm
pnpm create @boses my-app --templat=base
```

具体的 template 列表参考下面

## 模板列表

- [base](./src/template-base)：基础模板
- [react](./src/template-react)：react 基础模板

## 常见问题

**Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser. ...**

eslint 的规范选取了 [airbnb](https://github.com/iamturns/eslint-config-airbnb-typescript)，但是它本身有一个问题，如果你创建了一个新的目录例如 lib，它本身没有包含在 [tsconfig.eslint.json](./tsconfig.eslint.json) 内，会导致 eslint 的规则校验出现报错信息，对此你只需要修改 [tsconfig.eslint.json](./tsconfig.eslint.json) 内容。

```js
// ...省略其他
'lib/*.js',
'lib/*.ts',
```

**git commit 提交失败**

项目默认使用了 [husky](https://github.com/typicode/husky) 来验证你的 git 提交信息，你可以使用 `npx cz` 的形式来进行代码的规范化提交。

## 后续更新计划

[todo](./TODU.md)

## License

[MIT License](./LICENSE)
