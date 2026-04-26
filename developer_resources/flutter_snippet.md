# Flutter UI Snippet: Janani App Home Screen

This snippet implements the "Cheerful" theme for the Janani App home screen in Flutter.

```dart
import 'package:flutter/material.dart';

void main() => runApp(JananiApp());

class JananiApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      theme: ThemeData(
        brightness: Brightness.light,
        primaryColor: Color(0xFFB2E2F2), // Soft Teal
        accentColor: Color(0xFFFFB7B2), // Soft Pink
        scaffoldBackgroundColor: Color(0xFFFDF6F6), // Warm off-white
      ),
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool isDarkMode = false;
  List<String> reminders = ["Iron Tablet", "Vitamins", "Hydration"];
  List<bool> completion = [false, false, true];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Namaste, Mother ✨', style: TextStyle(color: Color(0xFF5A5A40))),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Switch(
            value: isDarkMode,
            onChanged: (val) => setState(() => isDarkMode = val),
            activeColor: Colors.amber,
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Daily Greeting Card
            Container(
              padding: EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFFFB7B2), Color(0xFFB2E2F2)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(32),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('WEEK 24', style: TextStyle(
                    fontSize: 40, fontWeight: FontWeight.bold, color: Color(0xFF5A5A40)
                  )),
                  SizedBox(height: 8),
                  Text('Your baby is now the size of an ear of corn! 🌽',
                    style: TextStyle(color: Color(0xFF5A5A40).withOpacity(0.7))),
                  SizedBox(height: 20),
                  LinearProgressIndicator(value: 0.6, backgroundColor: Colors.white24, color: Colors.white),
                ],
              ),
            ),
            SizedBox(height: 32),
            // Tablet Reminder Checklist
            Text('Daily Reminders 💊', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            ...List.generate(reminders.length, (index) => CheckboxListTile(
              title: Text(reminders[index]),
              value: completion[index],
              onChanged: (v) => setState(() => completion[index] = v!),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            )),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        label: Text('Ask Janani'),
        icon: Icon(Icons.chat_bubble_outline),
        backgroundColor: Color(0xFFB2E2F2),
        foregroundColor: Color(0xFF5A5A40),
      ),
    );
  }
}
```
