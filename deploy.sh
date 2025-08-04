#!/bin/bash

# 🚀 Clean TODO App - Deployment Script
# This script helps you deploy your app to Vercel

echo "🚀 Starting deployment process..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - Clean TODO App"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if build works
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix the errors before deploying."
    exit 1
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create a new repository on GitHub.com"
echo "2. Run these commands:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Go to https://vercel.com"
echo "4. Sign up with GitHub"
echo "5. Click 'New Project'"
echo "6. Import your repository"
echo "7. Click 'Deploy'"
echo ""
echo "🎉 Your app will be live in 2-3 minutes!"
echo ""
echo "📱 Your app features:"
echo "✅ Create and manage tasks"
echo "✅ Drag and drop between columns"
echo "✅ Rich text editor with links and task lists"
echo "✅ Auto-save functionality"
echo "✅ Mobile responsive design"
echo "✅ Dark theme"
echo "✅ Sound effects"
echo ""
echo "🔗 Alternative deployment options:"
echo "- Netlify: https://netlify.com"
echo "- Railway: https://railway.app"
echo "- Render: https://render.com" 