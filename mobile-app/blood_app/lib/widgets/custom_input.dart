import 'package:flutter/material.dart';

class CustomInput extends StatelessWidget {
  final TextEditingController? controller;
  final String label;
  final bool obscureText;
  final IconData? prefixIcon;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final bool enabled;

  const CustomInput({
    super.key,
    this.controller,
    required this.label,
    this.obscureText = false,
    this.prefixIcon,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      enabled: enabled,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: prefixIcon != null ? Icon(prefixIcon) : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: validator,
    );
  }
}
