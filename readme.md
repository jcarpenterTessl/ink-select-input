# ink-select-input [![test](https://github.com/vadimdemedes/ink-select-input/workflows/test/badge.svg)](https://github.com/vadimdemedes/ink-select-input/actions)

> A fork of the [SelectInput](https://github.com/vadimdemedes/ink-select-input) component for [Ink](https://github.com/vadimdemedes/ink) with additional layout features.

## Install

```sh
npm install @jcarpenter-tessl/ink-select-input
```

## Usage

```jsx
import React from 'react';
import {render} from 'ink';
import SelectInput from 'ink-select-input';

const Demo = () => {
	const handleSelect = item => {
		// `item` = { label: 'First', value: 'first' }
	};

	const items = [
		{
			label: 'First',
			value: 'first'
		},
		{
			label: 'Second',
			value: 'second'
		},
		{
			label: 'Third',
			value: 'third'
		}
	];

	return <SelectInput items={items} onSelect={handleSelect} />;
};

render(<Demo />);
```

The user can navigate using arrow up/down keys or the <kbd>j</kbd> <kbd>k</kbd> keys, then press <kbd>return</kbd> to select. Alternatively, press the number key corresponding to an option to select it instantly.

<img src="media/demo.gif" width="508">

## Props

### items

Type: `array`\
Default: `[]`

Items to display in a list. Each item must be an object and have `label` and `value` props, it may also optionally have a `key` prop.
If no `key` prop is provided, `value` will be used as the item key.

### isFocused

Type: `boolean`\
Default: `true`

Listen to user's input. Useful in case there are multiple input components at the same time and input must be "routed" to a specific component.

### initialIndex

Type: `number`\
Default: `0`

Index of initially-selected item in `items` array.

### limit

Type: `number`

Number of items to display.

### indicatorComponent

Type: `Component`

Custom component to override the default indicator component.

### itemComponent

Type: `Component`

Custom component to override the default item component.

### onSelect

Type: `function`

Function to call when user selects an item. Item object is passed to that function as an argument.

### onHighlight

Type: `function`

Function to call when user highlights an item. Item object is passed to that function as an argument.

### direction

Type: `'row' | 'column'`\
Default: `'column'`

Controls the layout direction of the select input. When set to `'row'`, items will be displayed horizontally.

### dividerComponent

Type: `Component`

Custom component to render between items when in `'row'` direction. This is useful for adding visual separators between horizontal items.

## Navigation

The component supports multiple navigation methods:

- Arrow keys (↑/↓ for vertical, ←/→ for horizontal)
- `j`/`k` keys (vertical only)
- Tab/Shift+Tab for cycling through items
- Number keys (1-9) for direct selection
- Return key to select the highlighted item

When using Tab/Shift+Tab navigation, the selection will loop from last to first item (and vice versa). This behavior is different from arrow key navigation, which stops at the boundaries.
