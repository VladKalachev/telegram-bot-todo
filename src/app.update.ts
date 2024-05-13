import { AppService } from './app.service';
import {
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
import {
  CREATE_TASK,
  DELETE_TASK,
  DONE_TASK,
  EDIT_TASK,
  LIST_TASK,
} from './app.constants';
import { Context } from './context.interface';
import { showTodos } from './app.utils';

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
    const todos = await this.appService.getAll();
    if (!todos.length) {
      await ctx.reply('Список задач пустой');
      return;
    }
    await ctx.replyWithHTML(showTodos(todos));
  }

  @Hears(CREATE_TASK)
  async createTask(ctx: Context) {
    ctx.session.type = 'create';
    await ctx.deleteMessage();
    await ctx.reply('Опиши задачу');
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
      const todos = await this.appService.doneTask(Number(message));
      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }
      await ctx.replyWithHTML(showTodos(todos));
    }

    if (ctx.session.type === 'edit') {
      const [taskId, taskName] = message.split(' | ');
      const todos = await this.appService.editTask(Number(taskId), taskName);

      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }

      await ctx.replyWithHTML(showTodos(todos));
    }

    if (ctx.session.type === 'remove') {
      const todos = await this.appService.deleteTask(Number(message));
      if (!todos) {
        await ctx.deleteMessage();
        await ctx.reply('Задача с таким ID не найдена');
        return;
      }

      await ctx.replyWithHTML(showTodos(todos));
    }

    if (ctx.session.type === 'create') {
      const todos = await this.appService.createTask(message);
      await ctx.replyWithHTML(showTodos(todos));
    }
  }
}
