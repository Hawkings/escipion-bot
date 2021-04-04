import React from 'react';

export default function Main({children}: {children: React.ReactNode}) {
	return (
		<main className="min-h-full bg-mine-darker flex flex-col text-mine-primary">{children}</main>
	);
}
