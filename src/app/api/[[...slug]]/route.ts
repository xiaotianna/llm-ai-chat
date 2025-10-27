import { NextResponse } from 'next/server';

// 通用 404 响应处理器
function notFoundResponse() {
  return NextResponse.json(
    { message: 'API not found', code: 404 },
    { status: 404 }
  );
}

// 处理接口不存在的情况
export async function GET() {
  return notFoundResponse();
}

export async function POST() {
  return notFoundResponse();
}

export async function PUT() {
  return notFoundResponse();
}

export async function DELETE() {
  return notFoundResponse();
}

export async function PATCH() {
  return notFoundResponse();
}

export async function HEAD() {
  return notFoundResponse();
}

export async function OPTIONS() {
  return notFoundResponse();
}