import { Injectable } from '@nestjs/common';
import { Context, TelegramSession } from '../common/telegram.types';

/**
 * Service for managing the history of visited pages during a user's session.
 */
@Injectable()
export class TelegramHistoryService {
  /**
   * Saves the current page to the user's session history
   * if it does not match the last visited page.
   *
   * @param history - Array containing the history of visited pages.
   * @param page - Current page to be saved in the history.
   */
  savePageHistory(history: TelegramSession['pageHistory'], page: string) {
    const prevPage = history[history.length - 1];

    if (history.length == 0 || prevPage !== page) {
      history.push(page);
    }
  }

  /**
   * Retrieves the previous page from the session's page history.
   *
   * @param {Context} context - Context containing the session with page history.
   * @returns {string | null} - URL or identifier of the previous page,
   * or null if there is no previous page.
   */
  getPreviousPage(context: Context): string | null {
    const history = context?.session.pageHistory;

    if (!Array.isArray(history) || history.length < 2) {
      return null;
    }

    history.pop();
    return history[history.length - 1] ?? null;
  }
}
