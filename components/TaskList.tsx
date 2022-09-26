import { Task } from "../generated/graphql-frontend";

interface Props {
  tasks: Task[];
}

export const TaskList: React.FC<Props> = ({ tasks }) => {
  return (
    <ul className="class-list">
      {tasks.map((task) => {
        return (
          <li className="task-list-item" key={task.id}>
            {task.title} ({task.status})
          </li>
        );
      })}
    </ul>
  );
};
