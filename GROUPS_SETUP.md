# Groups System Setup

This document explains how to set up and use the new groups system in the Frogo application.

## Overview

The groups system allows users to:
- Create and join study groups
- Post messages within groups
- Comment on group posts
- Manage group membership

## Database Setup

### 1. Run the SQL Script

Copy the contents of `database/groups_tables.sql` and run them in your Supabase SQL editor.

This will create the following tables:
- `groups` - Group information
- `group_members` - Group membership
- `group_posts` - Posts within groups
- `group_comments` - Comments on group posts
- `group_post_likes` - Likes on group posts

### 2. Verify Tables

After running the script, verify that all tables were created successfully in your Supabase dashboard.

## Features

### Group Management
- **Create Groups**: Users can create public or private groups
- **Join Groups**: Users can join public groups or be invited to private ones
- **Leave Groups**: Users can leave groups they've joined
- **Group Discovery**: Browse all available groups or filter to show only your groups

### Posting & Interaction
- **Group Posts**: Members can post messages within their groups
- **Comments**: Users can comment on posts within groups
- **Real-time Updates**: Posts and comments appear immediately

### Privacy & Security
- **Private Groups**: Only members can see posts in private groups
- **Row Level Security**: All tables have proper RLS policies
- **Member Roles**: Admin, Moderator, and Member roles

## File Structure

```
src/
├── components/groups/
│   ├── GroupsManager.tsx    # Main groups interface
│   └── GroupFeed.tsx        # Individual group view
├── lib/social.ts            # Updated with group functions
└── app/social/page.tsx      # Groups tab integration
```

## Usage

1. **Navigate to Groups**: Click the "Groups" tab in the social sidebar
2. **Browse Groups**: View all available groups or filter to your groups
3. **Join Groups**: Click "Join" on any public group
4. **Create Groups**: Click "Create Group" to start a new study group
5. **Post Content**: Once joined, you can post and comment within groups

## Database Functions

The system includes several helper functions:
- `increment_group_members()` - Update member count
- `increment_group_posts()` - Update post count
- `increment_group_post_comments()` - Update comment count
- `increment_group_post_likes()` - Update like count

## API Methods

### Group Management
- `socialDB.createGroup()` - Create a new group
- `socialDB.getGroups()` - Get all groups
- `socialDB.getUserGroups()` - Get user's groups
- `socialDB.joinGroup()` - Join a group
- `socialDB.leaveGroup()` - Leave a group
- `socialDB.isGroupMember()` - Check membership

### Posts & Comments
- `socialDB.getGroupPosts()` - Get group posts
- `socialDB.createGroupPost()` - Create a group post
- `socialDB.getGroupComments()` - Get post comments
- `socialDB.createGroupComment()` - Create a comment

## Security Notes

- All tables have Row Level Security enabled
- Users can only see content from groups they're members of
- Group creators have admin privileges
- Private groups require membership to view content

## Troubleshooting

### Common Issues

1. **Permission Denied**: Make sure RLS policies are properly set up
2. **Missing Tables**: Verify the SQL script ran successfully
3. **Can't Join Groups**: Check if the group is private and you have proper permissions

### Debug Steps

1. Check Supabase logs for errors
2. Verify table permissions in Supabase dashboard
3. Test with different user roles

## Future Enhancements

Potential features to add:
- Group invitations
- Group announcements
- File sharing in groups
- Group events/calendar
- Group statistics
- Member search within groups
