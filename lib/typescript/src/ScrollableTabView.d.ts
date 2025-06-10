import { type JSX, type ReactElement, type ReactNode } from 'react';
type ScrollableTabViewProps = {
    children: ReactElement<TabType> | ReactElement<TabType>[];
    tabBarIndicatorStyle?: object;
    tabBarActiveTextColor?: string;
    tabBarInactiveTextColor?: string;
    tabBarContainerStyle?: object;
    tabBarTextStyle?: object;
    lazy?: boolean;
    initialTabIndex?: number;
};
export default function ScrollableTabView({ children, tabBarIndicatorStyle, tabBarActiveTextColor, tabBarInactiveTextColor, tabBarContainerStyle, tabBarTextStyle, lazy, initialTabIndex, }: ScrollableTabViewProps): import("react/jsx-runtime").JSX.Element;
export type TabType = (props: TabProps) => JSX.Element;
export type TabProps = {
    id: string;
    label: string;
    children: ReactNode;
};
export declare function Tab(props: TabProps): JSX.Element;
export {};
//# sourceMappingURL=ScrollableTabView.d.ts.map