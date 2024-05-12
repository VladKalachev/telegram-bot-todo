import { Markup } from 'telegraf';
import { DELETE_TASK, DONE_TASK, EDIT_TASK, LIST_TASK } from './app.constants';

export function actionButtons() {
  return Markup.keyboard(
    [
      Markup.button.callback(LIST_TASK, 'list'),
      Markup.button.callback(DONE_TASK, 'done'),
      Markup.button.callback(EDIT_TASK, 'edit'),
      Markup.button.callback(DELETE_TASK, 'delete'),
    ],
    {
      columns: 2,
    },
  );
}
