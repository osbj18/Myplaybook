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
