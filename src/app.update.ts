import { AppService } from './app.service';
import {
  Action,
  Ctx,
  Hears,
  InjectBot,
  Message,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { actionButtons } from './app.buttons';
import { DELETE_TASK, DONE_TASK, EDIT_TASK, LIST_TASK } from './app.constants';
import { Context } from './context.interface';
import { showTodos } from './app.utils';

const todos = [
  {
    id: 1,
    title: 'Задача 1',
    isCompleted: false,
  },
  {
    id: 2,
    title: 'Задача 2',
    isCompleted: false,
  },
  {
    id: 3,
    title: 'Задача 3',
    isCompleted: true,
  },
];

@Update()
export class AppUpdate {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly appService: AppService,
  ) {
    this.bot.telegram.setMyCommands([
      {
        command: 'start',
        description: 'Start Telegram',
      },
    ]);
  }

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет, ${ctx.message.from.first_name}!`);
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears(LIST_TASK)
  async listTask(ctx: Context) {
    await ctx.replyWithHTML(showTodos(todos));
  }

  @Hears(DONE_TASK)
  async doneTask(ctx: Context) {
    ctx.session.type = 'done';
    await ctx.deleteMessage();
    await ctx.reply('Напишите ID задачи');
  }

  @Hears(EDIT_TASK)
  async editTask(ctx: Context) {
    ctx.session.type = 'edit';
    await ctx.deleteMessage();
    await ctx.replyWithHTML(
      'Напишите ID и новое название задачи: \n\n' +
        'В формате - <b>1 | Новое задание </b>',
    );
  }

  @Hears(DELETE_TASK)
  async deleteTask(ctx: Context) {
    ctx.session.type = 'remove';
    await ctx.deleteMessage();
    await ctx.reply('Напишите ID задачи');
  }

  @On('text')
  async getMessage(@Message('text') message: string, @Ctx() ctx: Context) {
    if (!ctx.session.type) return;

    if (ctx.session.type === 'done') {
      const todo = todos.find((todo) => todo.id === Number(message));
      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }
      todo.isCompleted = !todo.isCompleted;
      await ctx.replyWithHTML(showTodos(todos));
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split(' | ');
      const todo = todos.find((todo) => todo.id === Number(taskId));
      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }
      todo.title = taskName;
      await ctx.replyWithHTML(showTodos(todos));
    }

    if (ctx.session.type === 'remove') {
      const todo = todos.find((todo) => todo.id === Number(message));
      if (!todo) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }

      await ctx.replyWithHTML(
        showTodos(todos.filter((todo) => todo.id !== Number(message))),
      );
    }
  }
}
