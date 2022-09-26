import Link from "next/link";
import { Task } from "../generated/graphql-frontend";
import { TaskListItem } from "./TaskListItem";

interface Props {
  tasks: Task[];
}

export const TaskList: React.FC<Props> = ({ tasks }) => {
  return (
    <ul className="task-list">
      {tasks.map((task) => {
        return <TaskListItem key={task.id} task={task} />;
      })}
    </ul>
  );
};
