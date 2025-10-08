let CURRENT_COMPUTATION: Set<number> | null = null;
let STATE_ID = 0;

function useCurrentComputation() {
  if (!CURRENT_COMPUTATION) {
    throw new Error("No current computation");
  }
  return CURRENT_COMPUTATION;
}
function setCurrentComputation(v: Set<number>) {
  CURRENT_COMPUTATION = v;
}
function useStateId() {
  return STATE_ID++;
}

export function useState<T>(init: T): [() => T, (v: T) => void] {
  let state = init;
  const id = useStateId();

  return [
    () => {
      useCurrentComputation().add(id);
      return state;
    },
    (v: T) => {
      console.log("changed state:", id, { from: state, to: v });
      state = v;
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(`changed:${id}`));
      }, 0);
    },
  ];
}

declare global {
  namespace JSX {
    type IntrinsicElements = Record<string, any>;
  }
}

export function h(
  tag: null | string | Function,
  props: null | Record<string, any>,
  ...children: any[]
): () => HTMLElement | null {
  if (typeof tag === "function") {
    return tag(props);
  }
  if (tag == null) {
    return () => null;
  }

  return () => {
    const el = document.createElement(tag);

    props = props == null ? {} : props;

    for (const key in props) {
      const listens = new Set<number>();
      setCurrentComputation(listens);
      if (key.startsWith("on")) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, props[key]);
        continue;
      } else {
        const v = props[key];

        const r = () => {
          const val = typeof v == "function" ? v() : v;

          if (tag === "input" && (key === "value" || key === "checked")) {
            (el as any)[key] = val;
          } else {
            el.setAttribute(key, val);
          }
        };

        listens.forEach((x) => window.addEventListener(`changed:${x}`, r));
      }
    }

    {
      const listens = new Set<number>();
      setCurrentComputation(listens);

      const r = () => {
        for (const ch of children) {
          if (typeof ch === "string") {
            el.appendChild(document.createTextNode(ch));
          } else {
            const genNodes = (c: unknown): (HTMLElement | Text)[] => {
              if (typeof c == "string") {
                return [document.createTextNode(c)];
              }
              if (typeof c === "function") {
                return genNodes(c());
              }
              if (typeof c === "number") {
                return [document.createTextNode(String(c))];
              }
              if (Array.isArray(c)) {
                return c.flatMap(genNodes);
              }
              if (c == null) {
                return [];
              }
              if (c instanceof HTMLElement) {
                return [c];
              }
              return [document.createTextNode(String(c))];
            };

            const c = ch();
            console.log({ appending: c });
            genNodes(c).forEach((node) => el.appendChild(node));
          }
        }
      };

      r();

      listens.forEach((x) =>
        window.addEventListener(`changed:${x}`, () => {
          el.innerHTML = "";
          r();
        })
      );
    }

    return el;
  };
}

export function render(el: () => HTMLElement | null, container: HTMLElement) {
  const rendered = el();
  if (rendered) {
    container.appendChild(rendered);
  }
}
