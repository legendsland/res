import subprocess
import pandas as pd
import matplotlib.pyplot as plt
import sys

# Check if filename is provided
if len(sys.argv) < 2:
    print("Usage: python git_lines_history.py <file_path>")
    sys.exit(1)

file_path = sys.argv[1]

# Get all commits that modified the file
commits = subprocess.check_output(
    ["git", "log", "--pretty=format:%H %ad", "--date=iso", "--", file_path]
).decode("utf-8").splitlines()

dates = []
lines_count = []

for line in commits:
    commit_hash, date = line[:40], line[41:]
    # Get file content at this commit
    try:
        content = subprocess.check_output(
            ["git", "show", f"{commit_hash}:{file_path}"]
        ).decode("utf-8", errors="ignore")
        line_count = len(content.splitlines())
        dates.append(pd.to_datetime(date))
        lines_count.append(line_count)
    except subprocess.CalledProcessError:
        continue

# Create DataFrame
df = pd.DataFrame({"date": dates, "lines": lines_count})
df = df.sort_values("date")

# Plot
plt.figure(figsize=(10,5))
plt.plot(df['date'], df['lines'], marker='o')
plt.xlabel("Date")
plt.ylabel("Number of lines")
plt.title(f"Line count history of {file_path}")
plt.grid(True)
plt.show()
