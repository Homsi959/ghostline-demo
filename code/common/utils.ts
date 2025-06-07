import { BUTTONS } from 'code/telegram/common/telegram.pages';
import { Markup } from 'telegraf';
import { InlineKeyboardButton, InlineKeyboardMarkup } from 'telegraf/types';
import { BuildInlineKeyboardOptions } from './types';

/**
 * Creates a Telegram keyboard from an array of buttons with a specified number of columns.
 * Substitutes variables from the payload into button templates.
 *
 * @param arr - Array of buttons.
 * @param columns - Number of columns (default is 1).
 * @param payload - Data for substitution into button templates.
 * @returns - Telegram keyboard.
 */
export function buildInlineKeyboard({
  arr,
  columns = 1,
  payload,
}: BuildInlineKeyboardOptions): Markup.Markup<InlineKeyboardMarkup> {
  const flatPayload: Record<string, string | number | boolean> = flattenObject(
    payload ?? {},
  );

  const keyboard: InlineKeyboardButton[][] = arr.reduce((acc, item, index) => {
    const columnIndex = Math.floor(index / columns);

    const replacedButton: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'string') {
        const replacedValue = value.replace(
          /{{(.*?)}}/g,
          (_match, keyName: string) => {
            const replacement = flatPayload[keyName];
            return replacement !== undefined ? String(replacement) : '';
          },
        );
        replacedButton[key] = replacedValue;
      }
    }

    if (!acc[columnIndex]) {
      acc[columnIndex] = [];
    }

    if (!replacedButton.url && !replacedButton.action) {
      console.warn(`❌ Button without action: ${JSON.stringify(item)}`);
      return acc;
    }

    const button = replacedButton.url
      ? Markup.button.url(replacedButton.text, replacedButton.url)
      : Markup.button.callback(
          replacedButton.text,
          replacedButton.action ?? '',
        );

    acc[columnIndex].push(button);
    return acc;
  }, [] as InlineKeyboardButton[][]);

  return Markup.inlineKeyboard(keyboard);
}

/**
 * Adds a "Go Back" button to the keyboard.
 *
 * @param keyboard - Existing Telegram keyboard (optional).
 * @returns - New keyboard with the "Go Back" button added.
 */
export function addGoBackButton(
  keyboard?: Markup.Markup<InlineKeyboardMarkup>,
) {
  // If the keyboard does not exist, create an empty one
  const keyboardArray = keyboard?.reply_markup.inline_keyboard || [];

  keyboardArray.push([
    Markup.button.callback(BUTTONS.GO_BACK.text, BUTTONS.GO_BACK.action || ''),
  ]);

  return Markup.inlineKeyboard(keyboardArray);
}

/**
 * Returns the class name or the provided string as the context for logs.
 *
 * @param classInstanceOrString - Class instance or context string.
 * @returns Class name or the provided string.
 */
export function buildContext(
  classInstanceOrString?: object | string,
): string | undefined {
  if (!classInstanceOrString) return undefined;

  return typeof classInstanceOrString == 'string'
    ? classInstanceOrString
    : classInstanceOrString.constructor.name;
}

/**
 * Formats the logging level for alignment and removes color escape sequences.
 *
 * @param level - Logging level (e.g., "info", "warn", "error").
 * @returns Formatted logging level in square brackets, padded to 9 characters.
 */
export function levelFormatted(level: string): string {
  const normalizedLevel = level.replace(/\u001b\[.*?m/g, '').toUpperCase(); // remove escape sequences
  const formatedLevel = `[${normalizedLevel}]`;
  return formatedLevel.padEnd(9);
}

/**
 * Converts a nested object into a flat object with dot-separated keys.
 *
 * @param obj - Nested object.
 * @param result - Internal parameter for accumulating the result.
 * @returns Flat object with paths as keys.
 */
export function flattenObject(
  obj: Record<string, any>,
  result: Record<string, any> = {},
): Record<string, any> {
  for (const [key, value] of Object.entries(obj)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      if (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        flattenObject(value as Record<string, any>, result);
      }
    } else {
      result[key] = value as unknown;
    }
  }

  return result;
}
