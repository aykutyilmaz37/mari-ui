// Faz 4c (entry içi tree-shaking): bir subpath birden çok export verdiğinde
// (`input` → Input, Textarea, OtpInput, SearchInput) tüketicinin bundler'ı
// kullanılmayan export'ları ancak modül seviyesindeki kod "saf" görünüyorsa
// atabilir. `forwardRef(...)`, `createContext(...)`, `cn(...)` gibi çağrılar,
// `X.displayName = "X"` atamaları ve `Platform.OS`/`tokens.x` gibi özellik
// erişimleri esbuild/Rollup için yan etkilidir → o export kullanılmasa bile
// bütün bağımlılıklarıyla bundle'da kalır.
//
// Kural modül seviyesinde (fonksiyon gövdelerinin DIŞINDA) şunları yakalar:
// - `/* @__PURE__ */` işaretsiz çağrı / `new` → çağrının önüne işaret koyun.
// - Özellik erişimi (`a.b`, `a[0]`) → değeri satır içine yazın ya da fonksiyona alın.
// - İfade deyimi (`X.displayName = …`, çıplak çağrı) → `forwardRef(function X(…))`
//   adlı fonksiyon verin; React adı oradan okur.
// Yetkili kontrol `pnpm size`daki "artık kod" testidir (dist'i gerçekten
// bundle'lar); bu kural aynı hatayı editörde erkenden gösterir.

const PURE = /[@#]__PURE__/;
const TRANSPARENT = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression"]);
const SCOPE_BOUNDARY = new Set(["ArrowFunctionExpression", "FunctionExpression", "ClassExpression"]);

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Modül seviyesinde yan etkili görünen kod (işaretsiz çağrı, özellik erişimi, atama) entry içi tree-shaking'i bozar.",
    },
    schema: [],
    messages: {
      call: "Modül seviyesinde işaretsiz çağrı: önüne `/* @__PURE__ */` koyun (yoksa bu export kullanılmasa da bundle'da kalır).",
      member: "Modül seviyesinde özellik erişimi yan etkili sayılır: değeri satır içine yazın ya da fonksiyona alın.",
      statement: "Modül seviyesinde ifade deyimi tree-shaking'i bozar (`X.displayName = …` yerine `forwardRef(function X(…))`).",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const isPure = (node) => sourceCode.getCommentsBefore(node).some((c) => PURE.test(c.value));

    function check(node) {
      if (!node || typeof node.type !== "string" || SCOPE_BOUNDARY.has(node.type)) return;
      if (TRANSPARENT.has(node.type)) return check(node.expression);
      if (node.type === "CallExpression" || node.type === "NewExpression") {
        if (!isPure(node)) {
          context.report({ node, messageId: "call" });
          return;
        }
        // İşaretli çağrının argümanları da saf olmalı (esbuild onları ayrıca değerlendirir).
        node.arguments.forEach(check);
        return;
      }
      if (node.type === "MemberExpression") {
        context.report({ node, messageId: "member" });
        return;
      }
      if (node.type === "TaggedTemplateExpression") {
        context.report({ node, messageId: "call" });
        return;
      }
      for (const key of Object.keys(node)) {
        if (key === "parent" || key === "typeAnnotation" || key === "typeArguments" || key === "typeParameters") continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach((c) => c && typeof c.type === "string" && check(c));
        else if (child && typeof child.type === "string") check(child);
      }
    }

    function checkStatement(statement) {
      const decl = statement.type === "ExportNamedDeclaration" || statement.type === "ExportDefaultDeclaration" ? statement.declaration : statement;
      if (!decl) return;
      if (decl.type === "VariableDeclaration") {
        for (const d of decl.declarations) check(d.init);
      } else if (decl.type === "ExpressionStatement" && !decl.directive) {
        context.report({ node: decl, messageId: "statement" });
      } else if (statement.type === "ExportDefaultDeclaration" && !decl.type.endsWith("Declaration")) {
        check(decl);
      }
    }

    return {
      Program(program) {
        program.body.forEach(checkStatement);
      },
    };
  },
};

export default rule;
