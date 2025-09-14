
const home = `# WorkOS
The official Documentation and Console management tool for WorkOS.

## Available routes:
- [Quick Start](quick_start): Get started with WorkOS
- [My Account](my_account): Get your WorkOS account information (id, email, name, etc.) and manage your account
- [Hosted UI](hosted_ui): Customizable hosted UI for authentication at any size
- [Enterprise Authentication](enterprise_auth): Single sign-on, passkeys, social login, passwords, and more
- [Roles and Permissions](roles_and_permissions): Advanced RBAC with custom roles and role assignment
- [Radar](radar): Protect your app from bots, fraud, and abuse
- [Widgets](widgets): Complete functionality for common enterprise app workflows
- [Custom Metadata](custom_metadata): Store additional information about users and organizations`

const quick_start = `# Quick Start
Get started with WorkOS.

## Features:
- Create a WorkOS project
- Create a WorkOS user
- Create a WorkOS organization`

const my_account = `# My Account
Our hosted UI provides a fully customizable authentication interface that scales seamlessly from mobile to desktop.

## Account Info:
ID: abc232323
Email: test@test.com
Name: Test User
Organization ID: abc232323
Organization Name: Test Organization

## Buttons:
- <button id="reset_sso_token">Reset Single Sign-On Token</button>
- <button id="refresh_api_key">Refresh API Key</button>`

const hosted_ui = `# Hosted UI
Our hosted UI provides a fully customizable authentication interface that scales seamlessly from mobile to desktop.

## Features:
- Pre-built themes
- Extensive customization options
- Brand matching capabilities
- Mobile to desktop scaling`

const enterprise_auth = `# Enterprise Authentication
Enterprise authentication supports SAML SSO, passkeys, and multiple social providers for seamless user access.

## Available routes:
- [Single Sign-On](create_sso): Implement single sign-on for your enterprise
- [Passkeys](passkeys): Passkeys for user access
- [Social Login](social_login): Social login options (Google, Apple, GitHub, etc.)
- [Passwords](passwords): Password management for your enterprise`

const create_sso = `# Single Sign-On
Single sign-on for your enterprise.

## Available routes:
- [Create Single Sign-On Token](create_sso_token): Create single sign-on token for your enterprise`

const create_sso_token = `# Create Single Sign-On Token
Create single sign-on token for your account.

## Post Request Schema:
{
    "account_id": string
}`

const refresh_api_key = `# Refresh API Key
Refresh API key for your account.

## Post Request Schema:
{} // empty object`

const roles_and_permissions = `# Roles and Permissions
Advanced role-based access control allows you to create custom roles with granular permissions.

## Capabilities:
- Custom role creation
- Granular permissions
- Multiple role assignment
- Role inheritance
- Complex organizational hierarchies management`

const radar = `# Radar
Radar provides comprehensive bot detection and fraud prevention using advanced machine learning algorithms.

## Features:
- Advanced ML algorithms
- User behavior analysis
- Real-time suspicious activity detection
- Automated blocking capabilities`
const widgets = `# Widgets
Pre-built widgets offer complete functionality for common enterprise workflows like user invitations and organization management.

## Features:
- User invitation workflows
- Organization management
- Seamless UI integration
- Design system customization
- Enterprise workflow automation`
const customMetadata = `# Custom Metadata
Store custom attributes and metadata for users and organizations to extend functionality beyond standard fields.

## Capabilities:
- Custom attribute storage
- User and organization metadata
- Multiple data type support
- Segmentation features
- Personalization options
- Compliance requirements support`

const invalid_route = `# Invalid Route
The route you are trying to access is invalid. Please try again.`

const ROUTES = {
    home,
    quick_start,
    my_account,
    hosted_ui,
    create_sso,
    create_sso_token,
    enterprise_auth,
    roles_and_permissions,
    radar,
    widgets,
    custom_metadata: customMetadata,
    invalid_route
}

export async function render(route: string, context: { sessionId: string, bearerToken?: string, routes: string[] }) {
    if (!ROUTES[route as keyof typeof ROUTES]) {
        return ROUTES.invalid_route;
    }
    return ROUTES[route as keyof typeof ROUTES];
}