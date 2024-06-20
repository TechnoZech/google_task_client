import React from 'react';

const TaskList = ({ tasks }) => {
  return (
    <div>
      <h2>Your Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
