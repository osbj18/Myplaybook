---

def print_summary(transactions):
def create_summary(name, amount, food_type):
---

# Myplaybook

En samling enkla Python-program för olika ändamål. Nedan hittar du beskrivning, instruktioner och exempel för varje program.

---

## Transaktionsanalys (transaktion_analys.py)

Ett program för att analysera och summera ekonomiska transaktioner, inklusive insättningar, uttag och statistik.

### Så här kör du programmet:

```bash
python transaktion_analys.py
```

---

## Kortdragare (kortdragare.py)

Ett program där du kan dra valfritt antal kort från en blandad kortlek och se dem visuellt i terminalen.

### Så här kör du programmet:

```bash
python kortdragare.py
```

---

## Matorder (matorder.py)

Ett menyprogram där du kan välja mellan italiensk och indisk mat, se tillgängliga rätter och lägga en beställning.

### Så här kör du programmet:

```bash
python matorder.py
```

---

## Sten, sax, påse (sten_sax_pase.py)

Ett enkelt spel där du möter datorn i sten, sax eller påse – bäst av 3!

### Så här kör du spelet:

```bash
python sten_sax_pase.py
```

---

## ToDo-lista (todo_lista.py)

Ett enkelt program för att hantera en att-göra-lista i terminalen.

### Så här kör du programmet:

```bash
python todo_lista.py
```
---

## Sten, sax, påse (rock_paper_scissors.py)

Ett enkelt spel där du möter datorn i sten, sax eller påse – bäst av 3!

### Så här kör du spelet:

```bash
python rock_paper_scissors.py
```

### Exempel på användning

```text
Let's play sten, sax eller påse mot datorn i en match bäst av 3!
Välj sten, sax eller påse: sten
Datorns val: sax
Du vann!
			```
 Poängställning: 
 Player: 1, Datorn: 0
```

### Kodexempel

```python
import random

print("Let's play sten, sax eller påse mot datorn i en match bäst av 3!")

player_wins = 0
computer_wins = 0

while player_wins < 2 and computer_wins < 2:
	player_choice = input("Välj sten, sax eller påse: ").lower()
	choices = ["sten","påse","sax"]
	computer_choice = random.choice(choices)
	print(f"Datorns val: {computer_choice}")

	if (player_choice == "sten" and computer_choice == "sax") or (player_choice == "sax" and computer_choice == "påse") or (player_choice == "påse" and computer_choice == "sten"):
		winner = "Player"
	elif player_choice == computer_choice:
		winner = "Tie"
	else:
		winner = "Computer"
    
	if winner == "Player":
		player_wins += 1
		print("Du vann!")
	elif winner == "Computer":
		computer_wins += 1
		print("Datorn vann!")
	else:
		print("Det blev lika, kör igen!")
    
	print(f" Poängställning: \n Player: {player_wins}, Datorn: {computer_wins}")

if player_wins > computer_wins:
	print("Du vann matchen!")
else:
	print("Datorn vann matchen!")
```
# Myplaybook


---

## ToDo-lista (todo.py)

Det här är ett enkelt program för att hantera en att-göra-lista i terminalen.

### Så här kör du programmet:

```bash
python todo.py
```

### Exempel på användning

```text
Your ToDo list is empty
options: 
1) Add Task
2) Remove Task
3) Quit
Enter your choice: 1
Adding task
Want to add: Plugga
Plugga added!
```

### Kodexempel

```python
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
```
