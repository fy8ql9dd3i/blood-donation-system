import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class Helpers {
  static void showSnackBar(
    BuildContext context,
    String message, {
    bool error = false,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? Colors.red : Colors.green,
      ),
    );
  }

  static String formatDate(DateTime date) {
    return DateFormat('dd MMM yyyy').format(date);
  }
}
