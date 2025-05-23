import {isDeepStrictEqual} from 'node:util';
import React, {type FC, useState, useEffect, useRef, useCallback} from 'react';
import arrayToRotated from 'to-rotated';
import {Box, useInput} from 'ink';
import Indicator, {type Props as IndicatorProps} from './Indicator.js';
import ItemComponent, {type Props as ItemProps} from './Item.js';
import Divider from './Divider.js';

type Props<V> = {
	/**
	 * Items to display in a list. Each item must be an object and have `label` and `value` props, it may also optionally have a `key` prop.
	 * If no `key` prop is provided, `value` will be used as the item key.
	 */
	readonly items?: Array<Item<V>>;

	/**
	 * Listen to user's input. Useful in case there are multiple input components at the same time and input must be "routed" to a specific component.
	 *
	 * @default true
	 */
	readonly isFocused?: boolean;

	/**
	 * Index of initially-selected item in `items` array.
	 *
	 * @default 0
	 */
	readonly initialIndex?: number;

	/**
	 * Flex direction to render items in. 'row' or 'column'
	 * @default 'column'
	 */
	readonly direction?: 'row' | 'column';

	/**
	 * Number of items to display.
	 */
	readonly limit?: number;

	/**
	 * Custom component to override the default indicator component.
	 */
	readonly indicatorComponent?: FC<IndicatorProps>;

	/**
	 * Custom component to override the default item component.
	 */
	readonly itemComponent?: FC<ItemProps>;

	/**
	 * Custom component to override the divider component in 'row' direction
	 */
	readonly dividerComponent?: FC<any>;

	/**
	 * Function to call when user selects an item. Item object is passed to that function as an argument.
	 */
	readonly onSelect?: (item: Item<V>) => void;

	/**
	 * Function to call when user highlights an item. Item object is passed to that function as an argument.
	 */
	readonly onHighlight?: (item: Item<V>) => void;
};

export type Item<V> = {
	key?: string;
	label: string;
	value: V;
};

function SelectInput<V>({
	items = [],
	isFocused = true,
	initialIndex = 0,
	indicatorComponent = Indicator,
	itemComponent = ItemComponent,
	dividerComponent = Divider,
	direction = 'column',
	limit: customLimit,
	onSelect,
	onHighlight,
}: Props<V>) {
	const hasLimit =
		typeof customLimit === 'number' && items.length > customLimit;
	const limit = hasLimit ? Math.min(customLimit, items.length) : items.length;
	const lastIndex = limit - 1;
	const [rotateIndex, setRotateIndex] = useState(
		initialIndex > lastIndex ? lastIndex - initialIndex : 0,
	);
	const [selectedIndex, setSelectedIndex] = useState(
		initialIndex ? (initialIndex > lastIndex ? lastIndex : initialIndex) : 0,
	);
	const previousItems = useRef<Array<Item<V>>>(items);

	useEffect(() => {
		if (
			!isDeepStrictEqual(
				previousItems.current.map(item => item.value),
				items.map(item => item.value),
			)
		) {
			setRotateIndex(0);
			setSelectedIndex(0);
		}

		previousItems.current = items;
	}, [items]);

	useInput(
		useCallback(
			(input, key) => {
				// Previous
				if (
					input === 'k' ||
					(key.tab && key.shift) ||
					(direction === 'column' && key.upArrow) ||
					(direction === 'row' && key.leftArrow)
				) {
					const lastIndex = (hasLimit ? limit : items.length) - 1;
					const atFirstIndex = selectedIndex === 0;

					// Only loop from first to last item if shift+tab was pressed
					if (atFirstIndex && !(key.tab && key.shift)) {
						return;
					}

					const nextIndex = hasLimit ? selectedIndex : lastIndex;
					const nextRotateIndex = atFirstIndex ? rotateIndex + 1 : rotateIndex;
					const nextSelectedIndex = atFirstIndex
						? nextIndex
						: selectedIndex - 1;

					setRotateIndex(nextRotateIndex);
					setSelectedIndex(nextSelectedIndex);

					const slicedItems = hasLimit
						? arrayToRotated(items, nextRotateIndex).slice(0, limit)
						: items;

					if (typeof onHighlight === 'function') {
						onHighlight(slicedItems[nextSelectedIndex]!);
					}
				}

				// Next
				if (
					input === 'j' ||
					key.tab ||
					(direction === 'column' && key.downArrow) ||
					(direction === 'row' && key.rightArrow)
				) {
					const atLastIndex =
						selectedIndex === (hasLimit ? limit : items.length) - 1;

					// Only loop from last to first item if tab was pressed
					if (atLastIndex && !key.tab) {
						return
					}

					const nextIndex = hasLimit ? selectedIndex : 0;
					const nextRotateIndex = atLastIndex ? rotateIndex - 1 : rotateIndex;
					const nextSelectedIndex = atLastIndex ? nextIndex : selectedIndex + 1;

					setRotateIndex(nextRotateIndex);
					setSelectedIndex(nextSelectedIndex);

					const slicedItems = hasLimit
						? arrayToRotated(items, nextRotateIndex).slice(0, limit)
						: items;

					if (typeof onHighlight === 'function') {
						onHighlight(slicedItems[nextSelectedIndex]!);
					}
				}

				// Enable selection directly from number keys.
				if (/^[1-9]$/.test(input)) {
					const targetIndex = Number.parseInt(input, 10) - 1;

					const visibleItems = hasLimit
						? arrayToRotated(items, rotateIndex).slice(0, limit)
						: items;

					if (targetIndex >= 0 && targetIndex < visibleItems.length) {
						const selectedItem = visibleItems[targetIndex];
						if (selectedItem) {
							onSelect?.(selectedItem);
						}
					}
				}

				if (key.return) {
					const slicedItems = hasLimit
						? arrayToRotated(items, rotateIndex).slice(0, limit)
						: items;

					if (typeof onSelect === 'function') {
						onSelect(slicedItems[selectedIndex]!);
					}
				}
			},
			[
				hasLimit,
				limit,
				rotateIndex,
				selectedIndex,
				items,
				onSelect,
				onHighlight,
			],
		),
		{isActive: isFocused},
	);

	const slicedItems = hasLimit
		? arrayToRotated(items, rotateIndex).slice(0, limit)
		: items;

	return (
		<Box flexDirection={direction}>
			{slicedItems.map((item, index) => {
				const isSelected = index === selectedIndex;

				return direction === 'column' ? (
					// @ts-expect-error - `key` can't be optional but `item.value` is generic T
					<Box key={item.key ?? item.value}>
						{React.createElement(indicatorComponent, {isSelected})}
						{React.createElement(itemComponent, {...item, isSelected})}
					</Box>
				) : (
					// @ts-expect-error - `key` can't be optional but `item.value` is generic T
					<Box key={item.key ?? item.value}>
						{React.createElement(itemComponent, {...item, isSelected})}
						{dividerComponent &&
							index < slicedItems.length - 1 &&
							React.createElement(dividerComponent)}
					</Box>
				);
			})}
		</Box>
	);
}

export default SelectInput;
