export const showTodos = (todos) =>
  `Ваш список задач:\n\n${todos.map((todo) => (todo.isCompleted ? '✅' : '⬜') + ' ' + todo.title + '\n\n').join('')}`;
