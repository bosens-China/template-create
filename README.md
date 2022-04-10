# template-create

创建模板文件的脚手架工具。

## 使用方式

```sh
# npm 6.x
npm init @boses --template base

# npm 7+, 需要额外的双横线：
npm init @boses my-app -- --template base

# yarn
yarn create @boses my-app --template base

# pnpm
pnpm create @boses my-app -- --template base
```

上面的 `my-app` 以及 `--template` 你也可以后续给出。

具体的 template 列表参考下面

## 模板列表

- [base](./src/template-base)：基础模板
- [react](./src/template-react)：React 基础模板

## 常见问题

**Parsing error: "parserOptions.project" has been set for @typescript-eslint/parser. ...**

Eslint 的规范选取了 [Airbnb](https://github.com/iamturns/eslint-config-airbnb-typescript)，但是它本身有一个问题，如果你创建了一个新的目录例如 lib，它本身没有包含在 [tsconfig.eslint.json](./tsconfig.eslint.json) 内，会导致 Eslint 的规则校验出现报错信息，对此你只需要修改 [tsconfig.eslint.json](./tsconfig.eslint.json) 内容。

```js
// ...省略其他
'lib/*.js',
'lib/*.ts',
```

**git commit 没有触发校验钩子**
因为 [husky](https://github.com/typicode/husky) 最新版本已经不再默认校验提交，你必须手动 `npx husky install` 初始化一次。

在默认安装时已经自动帮你完成这一步骤了，但是如果后续你推送到 github 然后 pull 下来需要你手动执行一次。

**怎么统一行尾序列**
在不同的项目中，默认对 `.gitattributes` 文件做了不同的配置，如果你新增了新的格式，例如 `py` 后缀可能需要你根据上述内容自己手动将相对应后缀添加到 .gitattributes 文件中。

**如何运行 git 规范提交**
你可以运行 `npx cz` ，然后根据操作一步步完成后续操作。

**git commit 提交失败**

项目默认使用了 [husky](https://github.com/typicode/husky) 来验证你的 git 提交信息，你可以使用 `npx cz` 的形式来进行代码的规范化提交。

## 后续更新计划

[todo](./TODU.md)

## License

[MIT License](./LICENSE)
