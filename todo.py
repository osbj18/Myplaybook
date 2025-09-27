todo_list = []

while True:
    if len(todo_list) == 0:
        print("Your ToDo list is empty")
    else:
        index = 1
        for task in todo_list:
            print(f"{index}. {task}")
            index += 1

    print("options: ")
    print("1) Add Task")
    print("2) Remove Task")
    print("3) Quit")

    choice = input("Enter your choice: ")
    if choice == "1":
        print("Adding task")
        new_task = input("Want to add: ")
        todo_list.append(new_task)
        print(f"{new_task} added!")
    elif choice == "2":
        print("Removing task")
        if len(todo_list) > 0:
            removing_task = todo_list.pop()
    elif choice == "3":
        print("Quitting")
        break
