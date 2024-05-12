import { AppService } from './app.service';
import {
  Action,
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
  ) {}

  @Start()
  async startCommand(ctx: Context) {
    await ctx.reply(`Привет, ${ctx.message.from.first_name}!`);
    await ctx.reply('Что ты хочешь сделать?', actionButtons());
  }

  @Hears(LIST_TASK)
  async listTask(ctx: Context) {
    await ctx.replyWithHTML(
      `Ваш список задач:\n\n${todos.map((todo) => (todo.isCompleted ? '✅' : '⬜') + ' ' + todo.title + '\n\n').join('')}
      `,
    );
  }

  @Hears(DONE_TASK)
  async doneTask(ctx: Context) {
    await ctx.reply('Напишите ID задачи');
    ctx.session.type = 'done';
  }

  @On('text')
  async getMessage(@Message() message: string, ctx: Context) {
    if (ctx.session.type) return;
  }

  @Hears(EDIT_TASK)
  async editTask(ctx: Context) {
    await ctx.replyWithHTML(
      `${todos.map((todo) => (todo.isCompleted ? '✅' : '⬜') + ' ' + todo.title + '\n\n').join('')}`,
    );
  }

  @Hears(DELETE_TASK)
  async deleteTask(ctx: Context) {
    await ctx.replyWithHTML(
      `${todos.map((todo) => (todo.isCompleted ? '✅' : '⬜') + ' ' + todo.title + '\n\n').join('')}`,
    );
  }

  // @Action('list')
  // async getAll(ctx: Context) {
  //   await ctx.reply(`LIST`);
  // }

  @Action('edit')
  async editCommand(ctx: Context) {
    await ctx.reply(`edit`);
  }

  @Action('delete')
  async deleteCommand(ctx: Context) {
    await ctx.reply(`delete`);
  }
}
