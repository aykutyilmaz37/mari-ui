// Bu repo'nun kök sorunlarından biriydi: 14 dosya React hook'u kullanıyordu
// ama "use client" direktifi taşımıyordu — sadece tüketicinin kendi
// layout'u client olduğu için gizleniyordu (bkz. plan Faz 3, madde 1).
// Bu kural aynı hatanın kütüphanede tekrarlanmasını derleme zamanında engeller.
//
// Not: Bu bir statik heuristiktir — "useX(" biçimindeki her çağrıyı React hook'u
// sayar (React'in kendi kural setinin de yaptığı gibi). Yanlış pozitif üretirse
// (örn. üçüncü taraf "use..." adlı yardımcı bir fonksiyon), dosya başına
// `// mari-ui-disable-next-line require-use-client-with-hooks` yerine standart
// eslint-disable yorumu kullanılabilir.

const HOOK_CALL_PATTERN = /^use[A-Z0-9]/;
const BROWSER_GLOBALS = new Set(["window", "document", "localStorage", "sessionStorage", "navigator"]);

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "React hook'u veya tarayıcı API'si kullanan dosyaların en üstünde \"use client\" direktifi bulunmasını zorunlu kılar.",
    },
    schema: [],
    messages: {
      missingDirective:
        '"{{ trigger }}" kullanılıyor ama dosyanın en üstünde "use client" direktifi yok. Bir kütüphane bileşeninde bu direktif tüketicinin root layout\'una değil, kendi dosyasına ait olmalı.',
    },
  },
  create(context) {
    let hasUseClientDirective = false;
    let trigger = null;

    return {
      Program(node) {
        hasUseClientDirective = node.body.some(
          (statement) =>
            statement.type === "ExpressionStatement" &&
            statement.expression.type === "Literal" &&
            statement.expression.value === "use client"
        );
      },
      CallExpression(node) {
        if (trigger || hasUseClientDirective) return;
        const callee = node.callee;
        // `useX()` VE `React.useX()` biçimlerinin ikisini de yakalar. Üye
        // erişiminde (`React.useRef()`) hook adı PROPERTY'dedir, OBJECT'te
        // değil — bu ayrım kaçırılırsa (önceki sürümde olduğu gibi)
        // `React.useRef`/`React.useEffect` kullanan dosyalar hiç yakalanmaz.
        const name =
          callee.type === "Identifier"
            ? callee.name
            : callee.type === "MemberExpression" && callee.property.type === "Identifier"
              ? callee.property.name
              : null;
        if (name && HOOK_CALL_PATTERN.test(name)) {
          trigger = `${name}(...)`;
        }
      },
      MemberExpression(node) {
        if (trigger || hasUseClientDirective) return;
        if (node.object.type === "Identifier" && BROWSER_GLOBALS.has(node.object.name)) {
          trigger = node.object.name;
        }
      },
      "Program:exit"(node) {
        if (trigger && !hasUseClientDirective) {
          context.report({ node, messageId: "missingDirective", data: { trigger } });
        }
      },
    };
  },
};

export default rule;
