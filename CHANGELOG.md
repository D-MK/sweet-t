# Changelog

All notable changes to the project are documented here.

## [Unreleased]

### Fixed
- **Firebase auth `auth/api-key-not-valid`**: Removed trailing commas and quotes from Firebase variables in `.env`. In `.env` files, use `KEY=value` with no trailing comma; quotes are only needed for values with spaces. The invalid API key was caused by the comma being included in the value.
