/**
 * Ambient type stubs for packages whose node_modules are not yet installed.
 * After `npm install` the real package types take precedence (skipLibCheck: true).
 */

// ─── Node.js globals ─────────────────────────────────────────────────────────

declare const process: {
  env: {
    NODE_ENV: "development" | "production" | "test";
    [key: string]: string | undefined;
  };
};

// ─── React module ─────────────────────────────────────────────────────────────

declare module "react" {
  export type ReactNode =
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>;

  export interface ReactElement<P = unknown, T = string | JSXElementConstructor<unknown>> {
    type: T;
    props: P;
    key: string | null;
  }

  export type Key = string | number;

  export type JSXElementConstructor<P> =
    | ((props: P) => ReactElement<unknown, unknown> | null)
    | (abstract new (props: P) => unknown);

  export interface FunctionComponent<P = Record<string, unknown>> {
    (props: P): ReactElement<unknown, unknown> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
  export type FC<P = Record<string, unknown>> = FunctionComponent<P>;

  // Ref types
  export interface RefObject<T> { readonly current: T | null; }
  export type MutableRefObject<T> = { current: T };
  export type RefCallback<T> = (instance: T | null) => void;
  export type Ref<T> = RefCallback<T> | RefObject<T> | MutableRefObject<T | null> | null;
  export type ForwardedRef<T> = RefCallback<T> | MutableRefObject<T | null> | null;
  export interface RefAttributes<T> { ref?: Ref<T> | null; }

  // forwardRef
  export interface ForwardRefExoticComponent<P> {
    (props: P): ReactElement<unknown> | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
  export function forwardRef<T, P = Record<string, unknown>>(
    render: (props: P, ref: ForwardedRef<T>) => ReactElement<unknown> | null
  ): ForwardRefExoticComponent<P & RefAttributes<T>>;

  // Type utilities
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ElementRef<_T> = any;

  export type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>> =
    T extends JSXElementConstructor<infer P> ? P :
    T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] :
    Record<string, unknown>;

  export type ComponentPropsWithoutRef<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>> =
    T extends JSXElementConstructor<infer P> ? Omit<P & Record<string, unknown>, "ref"> :
    T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] :
    Record<string, unknown>;

  export type ComponentPropsWithRef<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<unknown>> =
    ComponentPropsWithoutRef<T> & RefAttributes<unknown>;

  export type PropsWithChildren<P = Record<string, unknown>> = P & { children?: ReactNode };
  export type PropsWithoutRef<P> = Omit<P & Record<string, unknown>, "ref">;
  export type PropsWithRef<P> = P & RefAttributes<unknown>;
  export type CSSProperties = Record<string, string | number | undefined>;
  export type ElementType<P = unknown> = string | JSXElementConstructor<P>;
  export type ReactChild = ReactElement | string | number;
  export type ReactFragment = Iterable<ReactNode>;

  // Events
  export interface SyntheticEvent<T = Element> {
    currentTarget: T;
    target: EventTarget & T;
    preventDefault(): void;
    stopPropagation(): void;
  }
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T & { value: string; checked?: boolean; name?: string; type?: string };
  }
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {}
  export interface MouseEvent<T = Element> extends SyntheticEvent<T> {
    button: number; clientX: number; clientY: number;
    shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean;
  }
  export interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
    key: string; code: string; repeat: boolean;
    shiftKey: boolean; ctrlKey: boolean; metaKey: boolean; altKey: boolean;
  }
  export interface FocusEvent<T = Element> extends SyntheticEvent<T> {
    relatedTarget: EventTarget | null;
  }
  export interface WheelEvent<T = Element> extends SyntheticEvent<T> {
    deltaX: number; deltaY: number;
  }
  export type EventHandler<E extends SyntheticEvent<unknown>> = (event: E) => void;
  export type ChangeEventHandler<T> = EventHandler<ChangeEvent<T>>;
  export type FormEventHandler<T> = EventHandler<FormEvent<T>>;
  export type MouseEventHandler<T> = EventHandler<MouseEvent<T>>;
  export type KeyboardEventHandler<T> = EventHandler<KeyboardEvent<T>>;
  export type FocusEventHandler<T> = EventHandler<FocusEvent<T>>;

  // HTML Attributes
  export interface AriaAttributes {
    "aria-label"?: string; "aria-labelledby"?: string; "aria-describedby"?: string;
    "aria-hidden"?: boolean; "aria-expanded"?: boolean; "aria-selected"?: boolean;
    "aria-disabled"?: boolean; "aria-required"?: boolean; "aria-invalid"?: boolean | "grammar" | "spelling";
    "aria-live"?: "assertive" | "off" | "polite"; "aria-atomic"?: boolean;
    "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
    [key: `aria-${string}`]: unknown;
  }
  export interface DOMAttributes<T> {
    children?: ReactNode;
    onClick?: MouseEventHandler<T>; onDoubleClick?: MouseEventHandler<T>;
    onKeyDown?: KeyboardEventHandler<T>; onKeyUp?: KeyboardEventHandler<T>;
    onChange?: ChangeEventHandler<T>; onSubmit?: FormEventHandler<T>;
    onFocus?: FocusEventHandler<T>; onBlur?: FocusEventHandler<T>;
    onMouseEnter?: MouseEventHandler<T>; onMouseLeave?: MouseEventHandler<T>;
    onMouseDown?: MouseEventHandler<T>; onMouseUp?: MouseEventHandler<T>;
  }
  export interface HTMLAttributes<T> extends DOMAttributes<T>, AriaAttributes {
    className?: string; id?: string; style?: CSSProperties; role?: string;
    tabIndex?: number; title?: string; hidden?: boolean; dir?: string;
    draggable?: boolean; contentEditable?: boolean | "inherit";
    "data-state"?: string; "data-side"?: string; "data-align"?: string;
    "data-disabled"?: boolean;
    // Allow arbitrary data-* and other HTML attributes
    [key: string]: unknown;
  }
  export interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string; value?: string | number; defaultValue?: string | number;
    placeholder?: string; disabled?: boolean; required?: boolean; readOnly?: boolean;
    min?: string | number; max?: string | number; step?: string | number;
    name?: string; autoComplete?: string; autoFocus?: boolean;
    checked?: boolean; defaultChecked?: boolean;
    maxLength?: number; minLength?: number; multiple?: boolean; pattern?: string; form?: string;
    accept?: string;
  }
  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: "submit" | "reset" | "button"; disabled?: boolean;
    form?: string; name?: string; value?: string; autoFocus?: boolean;
  }
  export interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | readonly string[]; defaultValue?: string | readonly string[];
    disabled?: boolean; multiple?: boolean; name?: string; required?: boolean; size?: number;
  }
  export interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string; defaultValue?: string; disabled?: boolean; placeholder?: string;
    rows?: number; cols?: number; readOnly?: boolean; name?: string;
    maxLength?: number; minLength?: number; required?: boolean; wrap?: string;
  }
  export interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
    htmlFor?: string; form?: string;
  }
  export interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
    href?: string; target?: string; rel?: string; download?: boolean | string;
    hrefLang?: string;
  }
  export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string; src?: string; srcSet?: string;
    width?: number | string; height?: number | string;
    loading?: "lazy" | "eager"; decoding?: "async" | "auto" | "sync";
    crossOrigin?: "anonymous" | "use-credentials";
  }
  export interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
    action?: string; method?: string; encType?: string;
    noValidate?: boolean; autoComplete?: string; target?: string;
  }
  export interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
    colSpan?: number; rowSpan?: number; scope?: string; headers?: string;
  }
  export interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
    colSpan?: number; rowSpan?: number; headers?: string;
  }
  export interface SVGProps<T> extends AriaAttributes {
    ref?: Ref<T>; className?: string; children?: ReactNode;
    id?: string; style?: CSSProperties;
    [key: string]: unknown;
  }

  // Context
  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
    Consumer: FC<{ children: (value: T) => ReactNode }>;
    displayName?: string;
  }

  // Dispatch
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type DependencyList = ReadonlyArray<unknown>;
  export type EffectCallback = () => void | (() => void | undefined);

  // Hooks
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useCallback<T extends (...args: unknown[]) => unknown>(callback: T, deps: DependencyList): T;
  export function useMemo<T>(factory: () => T, deps: DependencyList): T;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  export function useContext<T>(context: Context<T>): T;
  export function createContext<T>(defaultValue: T): Context<T>;
  export function createContext<T>(defaultValue?: T): Context<T | undefined>;
  export function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, Dispatch<A>];
  export function useId(): string;
  export function useImperativeHandle<T, R extends T>(
    ref: Ref<T> | undefined, init: () => R, deps?: DependencyList
  ): void;
  export function createRef<T>(): RefObject<T>;

  // Misc
  export const Children: {
    map<T>(children: ReactNode, fn: (child: ReactElement) => T): T[];
    forEach(children: ReactNode, fn: (child: ReactElement) => void): void;
    count(children: ReactNode): number;
    toArray(children: ReactNode): ReactNode[];
    only(children: ReactNode): ReactElement;
  };
  export function isValidElement(object: unknown): object is ReactElement;
  export function memo<P extends Record<string, unknown>>(
    component: FunctionComponent<P>,
    propsAreEqual?: (prev: Readonly<P>, next: Readonly<P>) => boolean
  ): FunctionComponent<P>;
  export function lazy<T extends FunctionComponent<unknown>>(
    factory: () => Promise<{ default: T }>
  ): T;
  export const Fragment: FC<{ children?: ReactNode }>;
  export const Suspense: FC<{ fallback?: ReactNode; children?: ReactNode }>;

  // Minimal class component
  export abstract class Component<P = object, S = object> {
    props: Readonly<P> & { children?: ReactNode };
    state: Readonly<S>;
    constructor(props: P);
    setState(state: Partial<S> | ((prev: S, props: P) => Partial<S>)): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
  }
  export class PureComponent<P = object, S = object> extends Component<P, S> {}
}

// ─── Global JSX namespace ─────────────────────────────────────────────────────

declare namespace JSX {
  type Element = import("react").ReactElement<unknown, unknown>;
  interface ElementAttributesProperty { props: object; }
  interface ElementChildrenAttribute { children: object; }
  interface IntrinsicAttributes { key?: import("react").Key | null; }
  interface IntrinsicElements {
    [elemName: string]: {
      children?: import("react").ReactNode;
      className?: string; id?: string;
      style?: import("react").CSSProperties;
      ref?: import("react").Ref<unknown>;
      key?: import("react").Key | null;
      onClick?: import("react").MouseEventHandler<HTMLElement>;
      onKeyDown?: import("react").KeyboardEventHandler<HTMLElement>;
      onChange?: import("react").ChangeEventHandler<HTMLElement>;
      onSubmit?: import("react").FormEventHandler<HTMLElement>;
      onFocus?: import("react").FocusEventHandler<HTMLElement>;
      onBlur?: import("react").FocusEventHandler<HTMLElement>;
      href?: string; src?: string; alt?: string; type?: string;
      value?: string; defaultValue?: string; placeholder?: string;
      disabled?: boolean; required?: boolean; readOnly?: boolean;
      htmlFor?: string; role?: string; tabIndex?: number; title?: string;
      hidden?: boolean; name?: string; target?: string; rel?: string;
      method?: string; action?: string; encType?: string;
      checked?: boolean; defaultChecked?: boolean;
      rows?: number; cols?: number; multiple?: boolean;
      colSpan?: number; rowSpan?: number; scope?: string;
      width?: string | number; height?: string | number;
      viewBox?: string; fill?: string; stroke?: string;
      strokeWidth?: string | number; strokeLinecap?: string; strokeLinejoin?: string;
      d?: string; cx?: string | number; cy?: string | number; r?: string | number;
      xmlns?: string; "data-state"?: string; "data-side"?: string;
      "data-align"?: string; "data-disabled"?: boolean;
      // Allow any other attribute (e.g. dangerouslySetInnerHTML, suppressHydrationWarning, data-*, aria-*)
      [key: string]: unknown;
    };
  }
}

// ─── Global React namespace (for files using React.X without import) ──────────

declare namespace React {
  type ReactNode = import("react").ReactNode;
  type ReactElement<P = unknown, T = string | import("react").JSXElementConstructor<unknown>> = import("react").ReactElement<P, T>;
  type FC<P = Record<string, unknown>> = import("react").FC<P>;
  type FunctionComponent<P = Record<string, unknown>> = import("react").FunctionComponent<P>;
  type Key = import("react").Key;

  type JSXElementConstructor<P> = import("react").JSXElementConstructor<P>;
  type ElementType<P = unknown> = import("react").ElementType<P>;

  type Ref<T> = import("react").Ref<T>;
  type RefObject<T> = import("react").RefObject<T>;
  type MutableRefObject<T> = import("react").MutableRefObject<T>;
  type ForwardedRef<T> = import("react").ForwardedRef<T>;
  type RefAttributes<T> = import("react").RefAttributes<T>;
  type ForwardRefExoticComponent<P> = import("react").ForwardRefExoticComponent<P>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type ElementRef<_T> = any;

  type ComponentProps<T extends keyof JSX.IntrinsicElements | import("react").JSXElementConstructor<unknown>> =
    import("react").ComponentProps<T>;
  type ComponentPropsWithoutRef<T extends keyof JSX.IntrinsicElements | import("react").JSXElementConstructor<unknown>> =
    import("react").ComponentPropsWithoutRef<T>;
  type ComponentPropsWithRef<T extends keyof JSX.IntrinsicElements | import("react").JSXElementConstructor<unknown>> =
    import("react").ComponentPropsWithRef<T>;

  type PropsWithChildren<P = Record<string, unknown>> = import("react").PropsWithChildren<P>;
  type CSSProperties = import("react").CSSProperties;

  // Events
  type SyntheticEvent<T = Element> = import("react").SyntheticEvent<T>;
  type ChangeEvent<T = Element> = import("react").ChangeEvent<T>;
  type FormEvent<T = Element> = import("react").FormEvent<T>;
  type MouseEvent<T = Element> = import("react").MouseEvent<T>;
  type KeyboardEvent<T = Element> = import("react").KeyboardEvent<T>;
  type FocusEvent<T = Element> = import("react").FocusEvent<T>;
  type ChangeEventHandler<T> = import("react").ChangeEventHandler<T>;
  type FormEventHandler<T> = import("react").FormEventHandler<T>;
  type MouseEventHandler<T> = import("react").MouseEventHandler<T>;
  type KeyboardEventHandler<T> = import("react").KeyboardEventHandler<T>;

  // HTML Attributes
  type HTMLAttributes<T> = import("react").HTMLAttributes<T>;
  type InputHTMLAttributes<T> = import("react").InputHTMLAttributes<T>;
  type ButtonHTMLAttributes<T> = import("react").ButtonHTMLAttributes<T>;
  type SelectHTMLAttributes<T> = import("react").SelectHTMLAttributes<T>;
  type TextareaHTMLAttributes<T> = import("react").TextareaHTMLAttributes<T>;
  type LabelHTMLAttributes<T> = import("react").LabelHTMLAttributes<T>;
  type AnchorHTMLAttributes<T> = import("react").AnchorHTMLAttributes<T>;
  type ImgHTMLAttributes<T> = import("react").ImgHTMLAttributes<T>;
  type FormHTMLAttributes<T> = import("react").FormHTMLAttributes<T>;
  type ThHTMLAttributes<T> = import("react").ThHTMLAttributes<T>;
  type TdHTMLAttributes<T> = import("react").TdHTMLAttributes<T>;
  type SVGProps<T> = import("react").SVGProps<T>;

  type Context<T> = import("react").Context<T>;
  type Dispatch<A> = import("react").Dispatch<A>;
  type SetStateAction<S> = import("react").SetStateAction<S>;

  function forwardRef<T, P = Record<string, unknown>>(
    render: (props: P, ref: import("react").ForwardedRef<T>) => import("react").ReactElement<unknown> | null
  ): import("react").ForwardRefExoticComponent<P & import("react").RefAttributes<T>>;
}

// ─── Next.js ─────────────────────────────────────────────────────────────────

declare module "next" {
  export interface Metadata {
    title?: string; description?: string; keywords?: string | string[];
    robots?: string; [key: string]: unknown;
  }
}

declare module "next/navigation" {
  export function redirect(url: string): never;
  export function permanentRedirect(url: string): never;
  export function notFound(): never;
  export function usePathname(): string;
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(url: string): void;
  };
  export function useSearchParams(): {
    get(key: string): string | null;
    has(key: string): boolean;
    toString(): string;
  };
  export function useParams(): Record<string, string | string[]>;
}

declare module "next/link" {
  const Link: import("react").FC<{
    href: string | { pathname: string; query?: Record<string, string> };
    children?: import("react").ReactNode;
    className?: string; replace?: boolean; prefetch?: boolean;
    onClick?: () => void; target?: string; rel?: string;
    [key: string]: unknown;
  }>;
  export default Link;
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
    ip?: string;
    geo?: { city?: string; country?: string; region?: string };
    auth?: unknown;
  }
  export class NextResponse extends Response {
    static json(body: unknown, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, init?: ResponseInit | number): NextResponse;
    static next(init?: { request?: { headers?: Headers } }): NextResponse;
    static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
  }
}

declare module "next/font/google" {
  interface FontOptions {
    subsets?: string[]; weight?: string | string[];
    style?: string | string[]; display?: string; variable?: string;
  }
  interface FontResult { className: string; variable: string; style: { fontFamily: string }; }
  export function Inter(options: FontOptions): FontResult;
  export function Roboto(options: FontOptions): FontResult;
  export function Geist(options: FontOptions): FontResult;
  export function Poppins(options: FontOptions): FontResult;
  export function Open_Sans(options: FontOptions): FontResult;
}

declare module "next/image" {
  const Image: import("react").FC<{
    src: string; alt: string; width?: number; height?: number;
    className?: string; priority?: boolean; fill?: boolean;
    quality?: number; sizes?: string; loading?: "lazy" | "eager";
    placeholder?: string; blurDataURL?: string;
    [key: string]: unknown;
  }>;
  export default Image;
}

declare module "next/headers" {
  export function headers(): { get(name: string): string | null; has(name: string): boolean };
  export function cookies(): {
    get(name: string): { name: string; value: string } | undefined;
    set(name: string, value: string, options?: Record<string, unknown>): void;
    delete(name: string): void;
  };
}

// ─── NextAuth ─────────────────────────────────────────────────────────────────

declare module "next-auth" {
  export interface DefaultSession {
    /** Base user shape — augmented in src/lib/auth.ts with id and defaultCurrency. */
    user?: { name?: string | null; email?: string | null; image?: string | null };
    expires: string;
  }
  /**
   * Session is intentionally left without a `user` property here.
   * The concrete `user` shape is added by the module augmentation in src/lib/auth.ts
   * which TypeScript merges globally across the whole project.
   */
  export interface Session extends DefaultSession {}
  export interface User {
    id?: string; name?: string | null; email?: string | null;
    image?: string | null; defaultCurrency?: string;
  }
  export interface JWT {
    id?: string; defaultCurrency?: string;
    name?: string | null; email?: string | null;
    [key: string]: unknown;
  }
  export interface Account {
    provider: string; type: string; providerAccountId: string; [key: string]: unknown;
  }
  export default function NextAuth(config: Record<string, unknown>): {
    handlers: { GET: unknown; POST: unknown };
    /** Call with no args to get the current session; call with a handler to use as middleware. */
    auth: {
      (): Promise<Session | null>;
      (handler: (req: unknown) => unknown): unknown;
    };
    signIn: (provider?: string, options?: Record<string, unknown>) => Promise<void>;
    signOut: (options?: Record<string, unknown>) => Promise<void>;
  };
}

declare module "next-auth/providers/credentials" {
  export default function Credentials(config: {
    credentials?: Record<string, { label?: string; type?: string; placeholder?: string }>;
    authorize: (credentials: Record<string, unknown> | undefined) => Promise<unknown>;
    [key: string]: unknown;
  }): unknown;
}

declare module "next-auth/react" {
  import type { Session } from "next-auth";
  export function signOut(options?: { callbackUrl?: string; redirect?: boolean }): Promise<{ url: string }>;
  export function signIn(provider?: string, options?: Record<string, unknown>): Promise<unknown>;
  export function useSession(): {
    data: Session | null;
    status: "authenticated" | "unauthenticated" | "loading";
    update: (data?: unknown) => Promise<Session | null>;
  };
  export function SessionProvider(props: {
    children?: import("react").ReactNode;
    session?: Session | null;
  }): import("react").ReactElement;
}

declare module "next-auth/jwt" {
  export interface JWT {
    id?: string; defaultCurrency?: string;
    name?: string | null; email?: string | null;
    [key: string]: unknown;
  }
}

// ─── Lucide React ─────────────────────────────────────────────────────────────

declare module "lucide-react" {
  type LucideProps = {
    size?: number | string; strokeWidth?: number | string;
    color?: string; className?: string; [key: string]: unknown;
  };
  export type LucideIcon = import("react").FC<LucideProps>;

  export const LayoutDashboard: LucideIcon;
  export const Wallet: LucideIcon;
  export const ArrowLeftRight: LucideIcon;
  export const Bell: LucideIcon;
  export const Settings: LucideIcon;
  export const LogOut: LucideIcon;
  export const Download: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const DollarSign: LucideIcon;
  export const BarChart2: LucideIcon;
  export const PieChart: LucideIcon;
  export const Eye: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const X: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Menu: LucideIcon;
  export const Search: LucideIcon;
  export const Home: LucideIcon;
  export const User: LucideIcon;
  export const Lock: LucideIcon;
  export const Mail: LucideIcon;
  export const Info: LucideIcon;
  export const Trash2: LucideIcon;
  export const Upload: LucideIcon;
  export const FileText: LucideIcon;
  export const Activity: LucideIcon;
  export const Globe: LucideIcon;
  export const Calendar: LucideIcon;
  export const Clock: LucideIcon;
  export const Key: LucideIcon;
  export const Edit: LucideIcon;
  export const Package: LucideIcon;
  export const Loader2: LucideIcon;
  export const RefreshCcw: LucideIcon;
}

// ─── Recharts ─────────────────────────────────────────────────────────────────

declare module "recharts" {
  import type { FC, ReactNode } from "react";

  export interface TooltipProps<V = unknown, N = string> {
    active?: boolean;
    payload?: Array<{
      value?: V; name?: N; payload?: Record<string, unknown>;
      dataKey?: string; color?: string;
    }>;
    label?: string;
  }

  type CommonProps = { className?: string; children?: ReactNode; [key: string]: unknown };
  export const LineChart: FC<CommonProps>;
  export const BarChart: FC<CommonProps>;
  export const PieChart: FC<CommonProps>;
  export const AreaChart: FC<CommonProps>;
  export const Line: FC<CommonProps>;
  export const Bar: FC<CommonProps>;
  export const Area: FC<CommonProps>;
  export const Pie: FC<CommonProps>;
  export const Cell: FC<CommonProps>;
  export const XAxis: FC<CommonProps>;
  export const YAxis: FC<CommonProps>;
  export const CartesianGrid: FC<CommonProps>;
  export const Tooltip: FC<CommonProps>;
  export const Legend: FC<CommonProps>;
  export const ResponsiveContainer: FC<CommonProps>;
  export const ReferenceLine: FC<CommonProps>;
  export const ReferenceArea: FC<CommonProps>;
}

// ─── @prisma/client ───────────────────────────────────────────────────────────

declare module "@prisma/client" {
  export enum AssetType {
    STOCK = "STOCK",
    CRYPTO = "CRYPTO",
    ETF = "ETF",
    MUTUAL_FUND = "MUTUAL_FUND",
    BOND = "BOND",
  }

  export enum TransactionType {
    BUY = "BUY",
    SELL = "SELL",
    DIVIDEND = "DIVIDEND",
  }

  export enum AlertCondition {
    ABOVE = "ABOVE",
    BELOW = "BELOW",
  }

  export interface User {
    id: string; name: string; email: string; password: string;
    defaultCurrency: string; createdAt: Date;
    portfolios?: Portfolio[]; alerts?: PriceAlert[];
  }
  export interface Portfolio {
    id: string; name: string; userId: string; createdAt: Date;
    user?: User; assets?: Asset[];
  }
  export interface Asset {
    id: string; portfolioId: string; symbol: string; name: string;
    assetType: AssetType; quantity: number; averageBuyPrice: number;
    currency: string; notes: string | null; createdAt: Date; updatedAt: Date;
    portfolio?: Portfolio; transactions?: Transaction[]; alerts?: PriceAlert[];
  }
  export interface Transaction {
    id: string; assetId: string; type: TransactionType;
    quantity: number; pricePerUnit: number; fees: number;
    date: Date; notes: string | null; asset?: Asset;
  }
  export interface PriceAlert {
    id: string; userId: string; assetId: string; symbol: string;
    condition: AlertCondition; targetPrice: number; active: boolean;
    triggeredAt: Date | null; createdAt: Date; user?: User; asset?: Asset;
  }

  export namespace Prisma {
    class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, meta: { code: string; clientVersion: string });
    }
    class PrismaClientUnknownRequestError extends Error {}
    class PrismaClientValidationError extends Error {}
    class PrismaClientInitializationError extends Error {}
  }

  type FindArgs = Record<string, unknown>;

  export class PrismaClient {
    user: {
      findUnique(args: FindArgs): Promise<User | null>;
      findMany(args?: FindArgs): Promise<User[]>;
      create(args: FindArgs): Promise<User>;
      update(args: FindArgs): Promise<User>;
      delete(args: FindArgs): Promise<User>;
    };
    portfolio: {
      findUnique(args: FindArgs): Promise<Portfolio | null>;
      findMany(args?: FindArgs): Promise<Portfolio[]>;
      create(args: FindArgs): Promise<Portfolio>;
      update(args: FindArgs): Promise<Portfolio>;
      delete(args: FindArgs): Promise<Portfolio>;
    };
    asset: {
      findUnique(args: FindArgs): Promise<Asset | null>;
      findMany(args?: FindArgs): Promise<Asset[]>;
      create(args: FindArgs): Promise<Asset>;
      update(args: FindArgs): Promise<Asset>;
      delete(args: FindArgs): Promise<Asset>;
    };
    transaction: {
      findUnique(args: FindArgs): Promise<Transaction | null>;
      findMany(args?: FindArgs): Promise<Transaction[]>;
      create(args: FindArgs): Promise<Transaction>;
      update(args: FindArgs): Promise<Transaction>;
      delete(args: FindArgs): Promise<Transaction>;
    };
    priceAlert: {
      findUnique(args: FindArgs): Promise<PriceAlert | null>;
      findMany(args?: FindArgs): Promise<PriceAlert[]>;
      create(args: FindArgs): Promise<PriceAlert>;
      update(args: FindArgs): Promise<PriceAlert>;
      delete(args: FindArgs): Promise<PriceAlert>;
      deleteMany(args?: FindArgs): Promise<{ count: number }>;
      updateMany(args: FindArgs): Promise<{ count: number }>;
    };
    $disconnect(): Promise<void>;
    $connect(): Promise<void>;
    $transaction<T>(fn: (tx: PrismaClient) => Promise<T>): Promise<T>;
  }
}

// ─── bcryptjs ─────────────────────────────────────────────────────────────────

declare module "bcryptjs" {
  export function hash(s: string, saltOrRounds: string | number): Promise<string>;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
  export function genSaltSync(rounds?: number): string;
  export function hashSync(s: string, saltOrRounds: string | number): string;
  export function compareSync(s: string, hash: string): boolean;
  const bcrypt: {
    hash: typeof hash; compare: typeof compare;
    genSalt: typeof genSalt; hashSync: typeof hashSync; compareSync: typeof compareSync;
  };
  export default bcrypt;
}

// ─── clsx ─────────────────────────────────────────────────────────────────────

declare module "clsx" {
  export type ClassValue =
    | string | number | boolean | null | undefined
    | ClassValue[]
    | Record<string, unknown>;
  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

// ─── tailwind-merge ───────────────────────────────────────────────────────────

declare module "tailwind-merge" {
  export function twMerge(...classLists: (string | undefined | null | false)[]): string;
}

// ─── class-variance-authority ─────────────────────────────────────────────────

declare module "class-variance-authority" {
  type ClassProp = string | null | undefined | Record<string, unknown>;
  export function cva(
    base?: ClassProp,
    config?: Record<string, unknown>
  ): (...args: unknown[]) => string;
  export type VariantProps<_T extends (...args: unknown[]) => unknown> = Record<string, string | undefined>;
}

// ─── @radix-ui/react-dialog ───────────────────────────────────────────────────

declare module "@radix-ui/react-dialog" {
  import type { FC, ReactNode } from "react";
  type CommonProps = { children?: ReactNode; className?: string; [key: string]: unknown };
  export const Root: FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; defaultOpen?: boolean; children?: ReactNode }>;
  export const Trigger: FC<CommonProps>;
  export const Portal: FC<CommonProps>;
  export const Overlay: FC<CommonProps & { ref?: unknown }>;
  export const Content: FC<CommonProps & { ref?: unknown; onEscapeKeyDown?: () => void; onInteractOutside?: () => void }>;
  export const Header: FC<CommonProps>;
  export const Footer: FC<CommonProps>;
  export const Title: FC<CommonProps & { ref?: unknown }>;
  export const Description: FC<CommonProps & { ref?: unknown }>;
  export const Close: FC<CommonProps>;
}

// ─── @radix-ui/react-tabs ─────────────────────────────────────────────────────

declare module "@radix-ui/react-tabs" {
  import type { FC, ReactNode } from "react";
  type CommonProps = { children?: ReactNode; className?: string; [key: string]: unknown };
  export const Root: FC<{ defaultValue?: string; value?: string; onValueChange?: (value: string) => void; children?: ReactNode; className?: string }>;
  export const List: FC<CommonProps & { ref?: unknown }>;
  export const Trigger: FC<CommonProps & { value: string; ref?: unknown; disabled?: boolean }>;
  export const Content: FC<CommonProps & { value: string; ref?: unknown }>;
}

// ─── @radix-ui/react-label ────────────────────────────────────────────────────

declare module "@radix-ui/react-label" {
  import type { FC, ReactNode } from "react";
  export const Root: FC<{
    children?: ReactNode; className?: string;
    htmlFor?: string; ref?: unknown; [key: string]: unknown;
  }>;
}

// ─── @radix-ui/react-select ───────────────────────────────────────────────────

declare module "@radix-ui/react-select" {
  import type { FC, ReactNode } from "react";
  type CommonProps = { children?: ReactNode; className?: string; [key: string]: unknown };
  export const Root: FC<{ value?: string; defaultValue?: string; onValueChange?: (value: string) => void; disabled?: boolean; children?: ReactNode }>;
  export const Group: FC<CommonProps>;
  export const Value: FC<CommonProps & { placeholder?: string }>;
  export const Trigger: FC<CommonProps & { ref?: unknown }>;
  export const ScrollUpButton: FC<CommonProps & { ref?: unknown }>;
  export const ScrollDownButton: FC<CommonProps & { ref?: unknown }>;
  export const Content: FC<CommonProps & { ref?: unknown; position?: string; sideOffset?: number }>;
  export const Label: FC<CommonProps & { ref?: unknown }>;
  export const Item: FC<CommonProps & { ref?: unknown; value: string; disabled?: boolean }>;
  export const ItemText: FC<CommonProps>;
  export const ItemIndicator: FC<CommonProps>;
  export const Separator: FC<CommonProps & { ref?: unknown }>;
  export const Icon: FC<CommonProps & { asChild?: boolean }>;
  export const Portal: FC<CommonProps>;
  export const Viewport: FC<CommonProps & { ref?: unknown }>;
}

// ─── @radix-ui/react-slot ─────────────────────────────────────────────────────

declare module "@radix-ui/react-slot" {
  import type { FC, ReactNode } from "react";
  export const Slot: FC<{ children?: ReactNode; className?: string; ref?: unknown; [key: string]: unknown }>;
}

// ─── @radix-ui/react-toast ────────────────────────────────────────────────────

declare module "@radix-ui/react-toast" {
  import type { FC, ReactNode } from "react";
  type CommonProps = { children?: ReactNode; className?: string; [key: string]: unknown };
  export const Provider: FC<{ children?: ReactNode; duration?: number; swipeDirection?: string }>;
  export const Viewport: FC<CommonProps & { ref?: unknown }>;
  export const Root: FC<CommonProps & { ref?: unknown; open?: boolean; onOpenChange?: (open: boolean) => void; duration?: number; variant?: string; type?: string }>;
  export const Action: FC<CommonProps & { ref?: unknown; altText: string }>;
  export const Close: FC<CommonProps & { ref?: unknown }>;
  export const Title: FC<CommonProps & { ref?: unknown }>;
  export const Description: FC<CommonProps & { ref?: unknown }>;
  export type ToastActionElement = ReactNode;
  export type ToastProps = CommonProps;
}

// ─── Tailwind (keep existing stubs) ───────────────────────────────────────────

declare module "tailwindcss" {
  export interface Config {
    content?: string[];
    darkMode?: string | string[];
    theme?: Record<string, unknown>;
    plugins?: unknown[];
    prefix?: string;
    separator?: string;
    important?: boolean | string;
    [key: string]: unknown;
  }
}

declare module "tailwindcss-animate" {
  const plugin: unknown;
  export default plugin;
}

declare module "tailwindcss/plugin" {
  function plugin(
    handler: () => void,
    config?: Record<string, unknown>
  ): unknown;
  export = plugin;
}
