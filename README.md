---

## Transaktionsanalys (transaction_analyzer.py)

Ett program för att analysera och summera ekonomiska transaktioner, inklusive insättningar, uttag och statistik.

### Så här kör du programmet:

```bash
python transaction_analyzer.py
```

### Exempel på användning

```text
Choose between print, analyze or stop: print
3244.06
-2071.69
Balance: 1172.37
Choose between print, analyze or stop: analyze
Largest withdrawal: (-881.51, 'Utilities')
Largest deposit: (981.17, 'Investment Return')
Average deposit: 463.4371428571428
Average withdrawal: -295.9557142857143
Choose between print, analyze or stop: stop
Program ended.
```

### Kodexempel

```python
data = [
  (749.17, "Investment Return"),
  (-11.54, "Utilities"),
  (-247.58, "Online Shopping"),
  (981.17, "Investment Return"),
  (-410.65, "Rent"),
  (310.60, "Rent"),
  (563.70, "Gift"),
  (220.79, "Salary"),
  (-49.85, "Car Maintenance"),
  (308.49, "Salary"),
  (-205.55, "Car Maintenance"),
  (870.64, "Salary"),
  (-881.51, "Utilities"),
  (518.14, "Salary"),
  (-264.66, "Groceries")
]

def print_transactions(transactions):
	for amount, statement in transactions:
		print(f"${amount}, {statement}")

print_transactions(data)

def print_summary(transactions):
	deposits = [transaction[0] for transaction in transactions if transaction[0] >= 0]
		print("Invalid choice")
### Så här kör du programmet:
Welcome to the Food Order System!
Curry
## Kortdragare (card_drawer.py)

	Det här avsnittet gäller programmet för att dra kort ur en kortlek.

	**Filnamn:** `card_drawer.py`

	Ett program där du kan dra valfritt antal kort från en blandad kortlek och se dem visuellt i terminalen.

	### Så här kör du programmet:

	```bash
	python card_drawer.py
	```

	### Exempel på användning

	```text
	How many cards do you want to draw?: 2
		+-------+
		|A      |
		|       |
		|   ♠   |
		|       |
		|      A|
		+-------+
		+-------+
		|10     |
		|       |
		|   ♥   |
		|       |
		|     10|
		+-------+
	```

	### Kodexempel

	```python
	import random

		return None
		suits = ["♥", "♦", "♣", "♠"]
		ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
		deck = []
		for suit in suits:
			for rank in ranks:
				deck.append((suit, rank))
		return deck


		hand = []
		for _ in range(number_of_cards):
			if deck:
				hand.append(deck.pop())
			else:
				break
		return hand, deck

def display_available_meals(food_type):
	random.shuffle(deck)

	if food_type == "Italian":
		space = " "
		if len(card[1]) == 2:
			space = ""
		print (f"""
		+-------+
		|{card[1]}     {space}|
		|       |
		|   {card[0]}   |
		|       |
		|{space}     {card[1]}|
		+-------+""")

	while len(deck) > 0:
		num_cards = int(input("How many cards do you want to draw?: "))
		if num_cards > len(deck):
			break
		else:
			hand, deck = draw_card(deck, num_cards)
			for card in hand:
				show_card(card)

	print("We are out of cards!")
	```
		print("Available Italian Meals: ")
		for meals in italian_food:
			---

			## Kortdragare (card_drawer.py)

			Ett program där du kan dra valfritt antal kort från en blandad kortlek och se dem visuellt i terminalen.

			### Så här kör du programmet:

			```bash
			python card_drawer.py
			```

			### Exempel på användning

			```text
			How many cards do you want to draw?: 2
				+-------+
				|A      |
				|       |
				|   ♠   |
				|       |
				|      A|
				+-------+
				+-------+
				|10     |
				|       |
				|   ♥   |
				|       |
				|     10|
				+-------+
			```

			### Kodexempel

			```python
			import random

			print(meals)
	elif food_type == "Indian":
		print("Available Indian Meals: ")
		for meals in indian_food:
			print(meals)
	else:
		print("Invalid food type")

def create_summary(name, amount, food_type):
	order = select_meal(name, food_type)
	if order:
		return (f"You ordered {amount} of {name}!")
	else: 
		return ("Meal not found")

print("Welcome to the Food Order System!")

type_input = input("What type of food do you want to choose from, Italian or Indian?: ")
display_available_meals(type_input)
name_input = input("Choose your meal: ")
amount_input = input("How many of them do you want?: ")

result = create_summary(name_input, amount_input, type_input)
print(result)
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
