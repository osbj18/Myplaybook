italian_food = ["Pasta Bolognesse", "Pepperoni Pizza", "margherita pizza", "Lasagna"]
indian_food = ["Curry", "Chutney", "Samosa", "Naan"]

def find_meal(name, menu):
  return name if name in menu else None

def select_meal(name, food_type):
  if name in italian_food:
    return find_meal(name, italian_food)
  elif name in indian_food:
    return find_meal(name, indian_food)
  else:
    return None

def display_available_meals(food_type):
  if food_type == "Italian":
    print("Available Italian Meals: ")
    for meals in italian_food:
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
