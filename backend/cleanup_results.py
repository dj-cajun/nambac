from logic.json_manager import JSONManager

json_manager = JSONManager(data_dir="data")

print("Deleting Result Code 6...")
if json_manager.delete_results_by_code(6):
    print("✅ Result Code 6 entries deleted.")
else:
    print("⚠️ No Result Code 6 entries found or deletion failed.")

print("Deleting Result Code 7...")
if json_manager.delete_results_by_code(7):
    print("✅ Result Code 7 entries deleted.")
else:
    print("⚠️ No Result Code 7 entries found or deletion failed.")